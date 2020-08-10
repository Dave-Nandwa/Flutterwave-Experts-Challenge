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
  banks: any = [{
      name: 'Citi Bank',
      balance: 0,
      accountNo: '######0000',
      image: 'assets/imgs/mc.png',

    },
    {
      name: 'Santander',
      balance: 0,
      accountNo: '######0000',
      image: 'assets/imgs/b-1.png'
    },
    {
      name: 'Deutsche Bank',
      balance: 0,
      accountNo: '######0000',
      image: 'assets/imgs/b-3.png'
    },
    {
      name: 'Credit Agricole',
      balance: 0,
      accountNo: '######0000',
      image: 'assets/imgs/b-4.png'
    },
    {
      name: 'Bank of America',
      balance: 0,
      accountNo: '######0000',
      image: 'assets/imgs/b-5.png'
    },
    {
      name: 'Chase Bank',
      balance: 1000,
      accountNo: '######0000',
      image: 'assets/imgs/b-6.png'
    },
    {
      name: 'Barclays',
      balance: 0,
      accountNo: '######0000',
      image: 'assets/imgs/b-7.png'
    },
    {
      name: 'HSBC',
      balance: 0,
      accountNo: '######0000',
      image: 'assets/imgs/b-8.png'
    },
    {
      name: 'Wells Fargo',
      balance: 0,
      accountNo: '######0000',
      image: 'assets/imgs/b-9.png'
    },

    {
      name: 'Bank Mandiri',
      balance: 0,
      accountNo: '######0000',
      image: 'assets/imgs/b-10.png'
    }
  ];

  userData: any = {};
  transactions: any = [];
  users: any = [];
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
            this.router.navigateByUrl('/login');
          });
        });
      } else {
        this.spinner.hide();
        Swal.fire({
          icon: 'error',
          title: 'Auth Error',
          text: 'Kindly Log In First.',
        }).then(() => {
          this.router.navigateByUrl('/login');
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
      })
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
    const obj = {
      "currency": user.currency,
      "amount": user.amount,
      "name": user.fullName,
      "address": user.address,
      "country": user.countryCode,
    }
    this.dataServ.createVirtualCard(obj).subscribe((res) => {
      console.log(res);
    }, (err) => {
      Swal.fire(
        'Error',
        err.message,
        'error'
      );
    })
  }

}