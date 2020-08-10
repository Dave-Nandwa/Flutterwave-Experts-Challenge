import {
  Component,
  OnInit
} from '@angular/core';
import {
  AuthService
} from 'src/app/services/auth.service';
import {
  UtilitiesService
} from 'src/app/services/utilities.service';
import {
  Router
} from '@angular/router';
import {
  NgxSpinnerService
} from 'ngx-spinner';
import Swal from 'sweetalert2';
import {
  AngularFireAuth
} from '@angular/fire/auth';
import {
  AngularFirestore
} from '@angular/fire/firestore';
import {
  DataService
} from 'src/app/services/data.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  //Not able to generate them in sandbox, proof of concept for display purposes
  cards: any = [{
    name: "John's Loyalty Card",
    balance: 0,
    accountNo: '######0000',
    image: 'assets/imgs/mc.png',

  }, 
  {
    name: "David's Loyalty Card",
    balance: 293,
    accountNo: '######0000',
    image: 'assets/imgs/mc.png',
  }];

  userData: any = {};
  transactions: any = [];
  users: any = [];
  fetchedUser: any = {};
  compoundTotal: number = 0;
  constructor(
    private authService: AuthService,
    private utils: UtilitiesService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private dataServ: DataService
  ) {}

  ngOnInit(): void {
    this.getUserData();
  }

  /* ------------------------------- LogOut Auth ------------------------------ */

  logOut() {
    this.authService.logout().then(() => {
      this.router.navigateByUrl('/login');
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                        Get Authenticated User Object                       */
  /* -------------------------------------------------------------------------- */

  /* ------- A bit of callback hell in this function, but it's bearable ------- */

  async getUserData() {
    this.spinner.show();
    const userSub = this.afAuth.authState.subscribe((user) => {
      if (user) {
        const dataSub = this.afs.doc(`merchants/${user.uid}`).valueChanges().subscribe(async (userData) => {
          this.userData = userData;
          await this.getAllTransactions();
          await this.getAllUsers();
          dataSub.unsubscribe();
        }, (err) => {
          this.spinner.hide();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.message,
          }).then(() => {
            this.router.navigateByUrl('/admin/login');
          });
        });
      } else {
        this.spinner.hide();
        Swal.fire({
          icon: 'error',
          title: 'Auth Error',
          text: 'Kindly Log In First.',
        }).then(() => {
          this.router.navigateByUrl('/admin/login');
        });
      }
      userSub.unsubscribe();
    }, (err) => {
      this.spinner.hide();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
      }).then(() => {
        this.router.navigateByUrl('/login');
      });
    });
  }

  /* -------------------- Fetch Transaction History From DB ------------------- */

  async getAllTransactions() {
    this.afs.collection('transactions').get().toPromise().then((snapshot) => {
      snapshot.forEach((doc) => {
        console.log(doc.data());
        this.transactions.push(doc.data());
        this.compoundTotal += parseFloat(doc.data().amount)
      });
    })
  }

  async getAllUsers() {
    this.afs.collection('users', ref => ref.orderBy('amountSpent', 'desc')).get().toPromise().then((snapshot) => {
      this.spinner.hide();
      snapshot.forEach((doc) => {
        console.log(doc.data());
        this.users.push(doc.data());
      })
    })
  }

  createVirtualCard(user) {
    /* ------------------ Virtual Cards not Working in Sandbox, Left the Code in just for implementation proof ------------------ */
    // My Payload is correct I was informed that Virtual Card issuing is not supported in the sandbox
    Swal.fire(
      'Virtual Cards Sandbox',
      'Unfortunately Virtual Cards are down at the moment, please try again later.',
      'error'
    );
    // const obj = {
    //   "currency": user.currency,
    //   "amount": user.amount,
    //   "name": user.fullName,
    //   "address": user.address,
    //   "country": user.countryCode,
    // }
    // this.dataServ.createVirtualCard(obj).subscribe((res) => {
    //   console.log(res);
    // }, (err) => {
    //   console.log(err);
    //   Swal.fire(
    //     'Error',
    //     'Error Creating Virtual Card, please try again later.',
    //     'error'
    //   );
    // })
  }

  getUserByEmail(email) {
    this.spinner.show();
    this.afs.collection('users', ref => ref.where('email', '==', email)).get().toPromise().then((snapshot) => {
      this.spinner.hide();
      snapshot.forEach((doc) => {
        console.log(doc.data());
        this.fetchedUser = (doc.data());
        this.createVirtualCard(this.fetchedUser);
      });

    })
  }

  /* ---------- Prompt Merchant For Email of Customer to Link Card To --------- */

  async askForEmail() {
    const {
      value: formValue
    } = await Swal.fire({
      title: 'Multiple inputs',
      html: '<input id="email-addr" placeholder="Customer Email" class="swal2-input">',
      focusConfirm: false,
      preConfirm: () => {
        let emailInput: any = document.getElementById('email-addr');
        return [
          emailInput.value
        ]
      }
    })

    if (formValue) {
      this.getUserByEmail(formValue[0])
    }

  }

}