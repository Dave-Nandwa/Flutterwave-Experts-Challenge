const functions = require('firebase-functions');
const dotenv = require('dotenv').config({
  path: __dirname + '/.env'
})
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const request = require("request");


const devEnv = 'sandbox';

const serviceAccount = require("./privateKey.json");
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://flutterwave-store.firebaseio.com"
});

/* -------------------------------------------------------------------------- */
/*                           Express and Body Parser                          */
/* -------------------------------------------------------------------------- */

const app = express();

// app.use(logger("dev"));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: false
}));

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
  extended: true
}));


// app.use(express.urlencoded({
//     extended: false
// }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));



/* ---------------- Automatically allow cross-origin requests --------------- */

app.use(cors({
  origin: true
}));


/* -------------------------------------------------------------------------- */
/*                                   FlutterWave Keys                         */
/* -------------------------------------------------------------------------- */

const SECRET_KEY = (devEnv === 'sandbox') ? process.env.SANDBOX_KEY : process.env.FWAVE_SECRET_KEY;
const PUBLIC_KEY = (devEnv === 'sandbox') ? process.env.PUBLIC_SANDBOX_KEY : process.env.FWAVE_PUBLIC_KEY;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const endpoint = process.env.ENDPOINT;

/* ----------------------------- Flutterwave SDK ---------------------------- */
const Flutterwave = require('flutterwave-node-v3');
var fwave = new Flutterwave(PUBLIC_KEY, SECRET_KEY);

const updateTransactionChargeStatus = (transactionId, updatedStatus, type) => {
  console.log('L1792', 'Charge Status Update Function Ran.');
  console.log(type);
  let docRef = admin.firestore().doc(`transactions/${transactionId}`);
  docRef.get().then((doc) => {
    if (doc.exists) {
      if (doc.data().status !== updatedStatus) {
        docRef.update({
          status: updatedStatus
        }).then(() => {
          console.log('L1800. Updated Charge Status as well!');
          return 'True';
        }).catch((err) => {
          throw new Error(err)
        });
      } else {
        //   Edge Case: whereby a hook might be sent twice, or this 
        //   function maybe triggered by the verification endpoint and a webhook as
        //   well.
        console.log('DUPLICATE HOOK, CAUGHT.')
      }
    } else {
      // doc.data() will be undefined in this case
      console.log("L1807. No such document! Do not proceed.", transactionId);
      return false;
    }
    return true;
  }).catch((error) => {
    console.log("Error getting document:", error);
    throw new Error(error);
  });
}

/* -------------------------------------------------------------------------- */
/*                                  Endpoints                                 */
/* -------------------------------------------------------------------------- */

app.get("/fwave-challenge", (req, res) => {
  const body = {
    "tx_ref": req.query.txref,
    "amount": parseInt(req.query.amount),
    "currency": req.query.currency,
    "customer": {
      "email": req.query.userEmail,
      "name": req.query.userName,
      "phonenumber": req.query.userPhone,
    },
    "payment_options": "card,mpesa,banktransfer,account,mobilemoneyrwanda,banktransfer,mobilemoneyzambia,mobilemoneyuganda,mobilemoneyfranco,mobilemoneyghana,mobilemoneytanzania,barter",
    "redirect_url": "https://us-central1-flutterwave-store.cloudfunctions.net/main/payment-verification",
    meta: {
      receiverUserId: req.query.receiverUserId,
      receiverCurrency: req.query.receiverCurrency,
      senderAmount: parseInt(req.query.amount),
      senderCurrency: req.query.senderCurrency,
      receiverEmail: req.query.receiverEmail,
      type: 'payment-link'
    },
    customizations: {
      "title": `Pay for your Groceries`,
      "description": `HoneyCoin: Africa's Payments Platform.`,
      "logo": `https://i.ibb.co/Ycr7Q99/favicon.png`
    },
  }
  request({
    method: "POST",
    url: `https://api.flutterwave.com/v3/payments`,
    headers: {
      Authorization: `Bearer ${SECRET_KEY}`
    },
    json: body
  }, (error, response) => {
    if (error) {
      res.status(401).json({
        success: false,
        error: error
      });
      throw new Error(error)
    } else {
      if (response.body.status === 'success') {
        res.status(200).json({
          success: true,
          response: response.body,
          link: response.body.data.link
        });
      } else {
        res.status(200).json({
          success: false,
          error: response.body
        });
      }
    }
    console.log(JSON.stringify(response.body));
  });
});

app.get("/payment-verification", (req, res) => {
  console.log('L139', JSON.stringify(req.query));

  /* -------------------------------------------------------------------------- */
  /*                         MOBILE PAYMENT VERIFICATION                        */
  /* -------------------------------------------------------------------------- */

  if (req.query.status === "successful") {
    console.log('L956 SUCCESS!');
    var payload = {
      "SECKEY": SECRET_KEY,
      "txref": req.query['tx_ref']
    };
    console.log(payload);
    request({
      method: "POST",
      // url: `https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/v2/verify`,
      url: `https://api.ravepay.co/flwv3-pug/getpaidx/api/v2/verify`,
      json: payload
    }, (error, response) => {
      console.log('L158', JSON.stringify(response.body));
      if (error) {
        res.status(401).json({
          success: false,
          error: error
        });
        //check if the amount is same as amount you wanted to charge just to be very sure
        res.sendFile(path.join(__dirname + '/error.html'));
        throw new Error(error)
      } else {
        if (response.body.data.status === "successful") {
          //check if the amount is same as amount you wanted to charge just to be very sure
          res.sendFile(path.join(__dirname + '/success.html'));
          updateTransactionChargeStatus(req.query['tx_ref'], response.body.data.status, 'verification');
          console.log(`============= META =====================`);
          console.log(JSON.stringify(response.body.data.meta))
          console.log(`============= META ABOVE =====================`);
          return true;
        } else {
          //check if the amount is same as amount you wanted to charge just to be very sure
          res.sendFile(path.join(__dirname + '/error.html'));
          console.log(`============= META =====================`);
          console.log(JSON.stringify(response.body.data.meta))
          console.log(`============= META ABOVE =====================`);
          return false;
        }
      }
    });
  }
  // Webhooks don't work well when cookies aare disabled this is a workaround
  /* -------------------------------------------------------------------------- */
  /*    COOKIE DISABLED & BRAVE BROWSER & DESKTOP PAYMENT VERIFICATION          */
  /* -------------------------------------------------------------------------- */
  else if (req.query['resp']) {
    const payloader = JSON.parse(req.query["resp"]);
    if (payloader.data.data.status === "successful") {
      console.log('L221 SUCCESS!');
      var payloadTwo = {
        "SECKEY": process.env.SECRET_KEY,
        "txref": payloader.data.data.txRef
      };
      res.sendFile(path.join(__dirname + '/success.html'));
      request({
        method: "GET",
        headers: {
          "Authorization": `Bearer ${SECRET_KEY}`
        },
        url: `https://api.flutterwave.com/v3/transactions/${payloader.data.data.id}/verify`
      }, (error, response) => {
        console.log('L842', JSON.stringify(response.body));
        const responsePayload = JSON.parse(response.body);
        if (error) {
          res.status(401).json({
            success: false,
            error: error
          });
          //check if the amount is same as amount you wanted to charge just to be very sure
          res.sendFile(path.join(__dirname + '/error.html'));
          throw new Error(error)
        } else {
          console.log(JSON.stringify(response.body));
          if (responsePayload.data.status === "successful") {
            console.log('L247. Transaction Verified Successful!')
            //check if the amount is same as amount you wanted to charge just to be very sure
            // res.sendFile(path.join(__dirname + '/success.html'));
            //Won't Work on Brave
            updateTransactionChargeStatus(payloader.data.data.txRef, response.body.data.status, 'verification');
            console.log(`============= META =====================`);
            console.log(JSON.stringify(responsePayload.data.meta))
            console.log(`============= META ABOVE =====================`)
          } else {
            console.log('L862. Error!');
            //check if the amount is same as amount you wanted to charge just to be very sure
            res.sendFile(path.join(__dirname + '/error.html'));
            console.log(`============= META =====================`);
            console.log(JSON.stringify(responsePayload.data.meta))
            console.log(`============= META ABOVE =====================`)
          }
        }
        // console.log(JSON.stringify(response.body));
      });
    }
  } else {
    res.sendFile(path.join(__dirname + '/error.html'));
    console.log("======================");
    console.log('ERROR L216: ');
    // const payloader = JSON.parse(req.query["resp"]);
    // console.log(payloader["data"]["status"]);
    // console.log('TXREF', req.query["resp"]["data"]["txRef"]);
    console.log("======================");
    return false;
  }
});

/* ------------------------------ Virtual Cards ----------------------------- */

app.get("/create-virtual-card", (req, res) => {
  const body = {
    "currency": req.query.currency,
    "amount": parseInt(amount),
    "billing_name": req.query.name,
    "billing_address": req.query.address,
    "billing_country": req.query.countryCode,
    "callback_url": req.query.callback
  }
  request({
    method: "POST",
    url: `https://api.flutterwave.com/v3/virtual-cards`,
    headers: {
      "Content-Type": 'application/json',
      "Authorization": `Bearer ${SECRET_KEY}`
    },
    json: body
  }, (err, response, body) => {
    if (err) {
      console.log("----------------------- ERROR -----------------------")
      console.log(err);
      res.status(401).json({
        message: err
      });
    } else {
      res.status(200).json(body);
    }
  });
});

app.get("/fund-card", (req, res) => {
  const body = {
    "debit_currency": req.query.currency,
    "amount": req.query.amount,
  }
  request({
    method: "POST",
    url: `https://api.flutterwave.com/v3/virtual-cards/${req.query.cardId}/fund`,
    headers: {
      "Authorization": `Bearer ${SECRET_KEY}`
    },
    json: body
  }, (err, response, body) => {
    if (err) {
      console.log("----------------------- ERROR -----------------------")
      console.log(err);
      res.status(401).json({
        message: err
      });
    } else {
      res.status(200).json(body);
    }
  });
});

app.get("/get-virtual-card", (req, res) => {
  request({
    method: "POST",
    url: `https://api.flutterwave.com/v3/virtual-cards/${req.query.cardId}`,
    headers: {
      "Authorization": `Bearer ${SECRET_KEY}`
    },
    json: body
  }, (err, response, body) => {
    if (err) {
      console.log("----------------------- ERROR -----------------------")
      console.log(err);
      res.status(401).json({
        message: err
      });
    } else {
      res.status(200).json(body);
    }
  });
});

app.get("/get-all-virtual-cards", (req, res) => {
  request({
    method: "POST",
    url: `https://api.flutterwave.com/v3/virtual-cards`,
    headers: {
      "Authorization": `Bearer ${SECRET_KEY}`
    },
    json: {}
  }, (err, response, body) => {
    if (err) {
      console.log("----------------------- ERROR -----------------------")
      console.log(err);
      res.status(401).json({
        message: err
      });
    } else {
      res.status(200).json(body);
    }
  });
});

app.get("/withdraw-from-virtual-card", (req, res) => {
  const body = {
    "secret_key": SECRET_KEY,
    "card_id": req.query.card_id,
    "amount": req.query.amount
  }
  request({
    method: "POST",
    url: `${endpoint}/v2/services/virtualcards/withdraw`,
    headers: {},
    json: body
  }, (err, response, body) => {
    if (err) {
      console.log("----------------------- ERROR -----------------------")
      console.log(err);
      res.status(401).json({
        message: err
      });
    } else {
      res.status(200).json(body);
    }
  });
});

app.get("/terminate-virtual-card", (req, res) => {
  const body = {
    "secret_key": SECRET_KEY,
  }
  request({
    method: "POST",
    url: `${endpoint}/v2/services/virtualcards/${req.query.card_id}/terminate`,
    headers: {},
    json: body
  }, (err, response, body) => {
    if (err) {
      console.log("----------------------- ERROR -----------------------")
      console.log(err);
      res.status(401).json({
        message: err
      });
    } else {
      res.status(200).json(body);
    }
  });
});

app.get("/freeze-unfreeze-virtual-card", (req, res) => {
  const body = {
    "status_action": req.query.status_action,
    "card_id": req.query.card_id
  }
  request({
    method: "POST",
    url: `${endpoint}/v2/services/virtualcards/card_id/status/status_action`,
    headers: {},
    json: body
  }, (err, response, body) => {
    if (err) {
      console.log("----------------------- ERROR -----------------------")
      console.log(err);
      res.status(401).json({
        message: err
      });
    } else {
      res.status(200).json(body);
    }
  });
});

/* ------------------------------------ - ----------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                  Webhooks                                  */
/* -------------------------------------------------------------------------- */



app.post("/transactions-webhook", async (req, response) => {
  /* It is a good idea to log all events received. Add code *
   * here to log the signature and body to db or file       */

  // retrieve the signature from the header
  var hash = req.headers["verif-hash"];

  if (!hash) {
    // discard the request,only a post with rave signature header gets our attention 
    console.log('Discard, Invalid Request.');
  } else {

    // Get signature stored as env variable on your server
    const secret_hash = process.env.MY_HASH;
    // check if signatures match
    if (hash !== secret_hash) {
      // silently exit, or check that you are passing the write hash on your server.
    } else {
      // Give value to your customer but don't give any output
      // Remember that this is a call from rave's servers and 
      // Your customer is not seeing the response here at all
      // response.sendStatus(200);
      console.log('\n======================== WEBHOOK ======================\n');
      // Retrieve the request's body
      console.log(JSON.stringify(req.body));
      console.log('\n======================== WEBHOOK BOTTOM ======================\n');
      console.log('------------------------ EVENT TYPE ----------------------');
      // console.log(req.body.event.type);
      console.log(req.body['event.type']);
      console.log('------------------------ EVENT TYPE ----------------------');
      if (req.body['event.type'] === 'MPESA_TRANSACTION' ||
        req.body['event.type'] === 'MOBILEMONEYGH_TRANSACTION' ||
        req.body['event.type'] === 'MMOBILEMONEYZM_TRANSACTION' ||
        req.body['event.type'] === 'MOBILEMONEYUG_TRANSACTION' ||
        req.body['event.type'] === 'MOBILEMONEYRW_TRANSACTION' ||
        req.body['event.type'] === 'MOBILEMONEYSN_TRANSACTION') {
        let transactionId = '';
        let updatedStatus = '';
        if (req.body.data) {
          updatedStatus = req.body.data.status;
          if (!req.body.data.txRef) {
            transactionId = req.body.data['tx_ref'];
          } else {
            transactionId = req.body.data.txRef;
          }
        } else {
          transactionId = req.body.txRef;
          updatedStatus = req.body.status;
        }
        // const updatedStatus = req.body.data.status;
        console.log('Transaction ID', 'Updated Status:')
        console.log(transactionId, updatedStatus);
        await updateTransactionChargeStatus(transactionId, updatedStatus, req.body['event.type']);
        response.sendStatus(200);
      } else if (req.body['event.type'] === 'CARD_TRANSACTION' ||
        req.body['event.type'] === 'ACCCOUNT_TRANSACTION') {
        let transactionId = '';
        let updatedStatus = '';
        if (req.body.data) {
          updatedStatus = req.body.data.status;
          if (!req.body.data.txRef) {
            transactionId = req.body.data['tx_ref'];
          } else {
            transactionId = req.body.data.txRef;
          }
        } else {
          transactionId = req.body['txRef'];
          updatedStatus = req.body.status;
        }
        // const updatedStatus = req.body.data.status;
        console.log('Transaction ID', 'Updated Status:')
        console.log(transactionId, updatedStatus)
        console.log('Card');
        await updateTransactionChargeStatus(transactionId, updatedStatus, req.body['event.type']);
        response.sendStatus(200);
      } else {
        console.log('Unknown Hook!')
      }
    }
  }
});


app.get("/cards-hook", (req, res) => {
  console.log('L524', JSON.stringify(req.query));

  /* -------------------------------------------------------------------------- */
  /*                         MOBILE PAYMENT VERIFICATION                        */
  /* -------------------------------------------------------------------------- */

  if (req.query.status === "successful") {
    console.log('L956 SUCCESS!');
    res.sendFile(path.join(__dirname + '/success.html'));
  }
  // Webhooks don't work well when cookies aare disabled this is a workaround
  /* -------------------------------------------------------------------------- */
  /*    COOKIE DISABLED & BRAVE BROWSER & DESKTOP CARD HOOK VERIFICATION        */
  /* -------------------------------------------------------------------------- */
  else if (req.query['resp']) {
    const payloader = JSON.parse(req.query["resp"]);
    if (payloader.data.data.status === "successful") {
      console.log('L221 SUCCESS!');
      res.sendFile(path.join(__dirname + '/success.html'));
    }
  } else {
    res.sendFile(path.join(__dirname + '/error.html'));
    console.log("======================");
    console.log('ERROR L551: ');
    console.log("======================");
    return false;
  }
});

/* -------------------------------------------------------------------------- */
/*                                      -                                     */
/* -------------------------------------------------------------------------- */

exports.main = functions.https.onRequest(app);