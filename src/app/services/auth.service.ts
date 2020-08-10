import {
  Injectable
} from '@angular/core';
import {
  AngularFireAuth
} from '@angular/fire/auth';
import {
  AngularFirestore
} from '@angular/fire/firestore';
import {
  first
} from 'rxjs/operators';

import {
  auth
} from 'firebase/app';
import * as firebase from 'firebase/app';

import {
  Router
} from '@angular/router';

import {
  UtilitiesService
} from './utilities.service';

import {
  countries
} from 'countries-list';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public userId: string;
  public currentUser;
  public userProfile;
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private utils: UtilitiesService
  ) {}

  getUser(): Promise < firebase.User > {
    return this.afAuth.authState.pipe(first()).toPromise();
  }

  updateUserProfile(userId, userData) {
    return this.firestore
      .doc(`users/${userId}`)
      .set(userData, {
        merge: true
      });
  }


  /* -------------------------------------------------------------------------- */
  /*      This Function simply logs in a user                                   */
  /* -------------------------------------------------------------------------- */

  loginUser(
    data
  ): Promise < firebase.auth.UserCredential > {
    return this.afAuth.auth.signInWithEmailAndPassword(data.email, data.password);
  }


  /* -------------------------------------------------------------------------- */
  /*      This Function Registers Users and Creates a Document in Firestore     */
  /* -------------------------------------------------------------------------- */

  async signupUser(
    data
  ): Promise < firebase.auth.UserCredential > {
    try {
      const newUserCredential: firebase.auth.UserCredential = await this.afAuth.auth.createUserWithEmailAndPassword(
        data.email,
        data.password
      );
      await this.firestore
        .doc(`users/${newUserCredential.user.uid}`)
        .set({
          amountSpent: 0,
          address: data.address,
          fullName: data.name,
          email: data.email,
          password: data.password,
          userId: newUserCredential.user.uid,
          locale: data.phone,
          //Neat way of getting user's currency
          currency: countries[data.phone.countryCode].currency,
        });
      return newUserCredential;
    } catch (error) {
      throw error;
    }
  }

  async signupMerchant(
    data
  ): Promise < firebase.auth.UserCredential > {
    try {
      const newUserCredential: firebase.auth.UserCredential = await this.afAuth.auth.createUserWithEmailAndPassword(
        data.email,
        data.password
      );
      await this.firestore
        .doc(`merchants/${newUserCredential.user.uid}`)
        .set({
          fullName: data.name,
          email: data.email,
          password: data.password,
          userId: newUserCredential.user.uid,
          balance: 0
        });
      return newUserCredential;
    } catch (error) {
      throw error;
    }
  }

  /* -------------------------------------------------------------------------- */
  /*    I added additional options just for fun, didn't implement in front end   */
  /* -------------------------------------------------------------------------- */

  async loginWithGoogle() {
    return await this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider())
    // this.router.navigate(['/home']);
  }

  async sendEmailVerification() {
    await this.afAuth.auth.currentUser.sendEmailVerification()
  }

  async sendPasswordResetEmail(passwordResetEmail: string) {
    return await this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail);
  }

  resetPassword(email: string): Promise < void > {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  logout(): Promise < void > {
    return this.afAuth.auth.signOut();
  }
}