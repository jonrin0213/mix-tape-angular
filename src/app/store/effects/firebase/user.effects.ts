
import * as firebase from 'firebase/app';
import {Injectable} from "@angular/core";
import {Action} from "@ngrx/store";
import { Actions, ofType, Effect } from '@ngrx/effects';
import { of, Observable} from 'rxjs';
import {
  SaveUserAction,
  USER_ACTION_TYPES,
  UserLoginAction,
  UserLoginSuccessAction,
  UserUnauthAction
} from "../../actions/user.action";
import {AngularFireAuth} from "@angular/fire/auth";
import {AngularFireDatabase} from "@angular/fire/database";
import {catchError, filter, map, mergeMap, switchMap, tap} from "rxjs/operators";
import "rxjs-compat/add/observable/fromPromise";
import "rxjs-compat/add/observable/of";


@Injectable()
export class AuthEffects {
  constructor(
    public afAuth: AngularFireAuth, private db: AngularFireDatabase,
    private actions$: Actions) { }

  @Effect() login$: Observable<Action> = this.actions$.pipe(
    ofType(USER_ACTION_TYPES.LOGIN),
    map((action: UserLoginAction) => action.payload),
    switchMap((payload) => {
      return Observable.fromPromise(this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider()))
        .pipe(
          map(user => new SaveUserAction(user)),
          catchError(res => Observable.of(new UserUnauthAction({})))
        )
    }
  ));

@Effect() saveUser$: Observable<Action> = this.actions$.pipe(
  ofType(USER_ACTION_TYPES.USER_SAVE),
  map((action: SaveUserAction) => action.payload),
  mergeMap((response) => {
    return this.db.object(`/users/${response.user.uid}`).valueChanges().pipe(
      switchMap((user) => {
        console.log(user);
        if (!user) {
          const { displayName, email, emailVerified, photoURL, uid } = response.user;
          this.db.object(`/users/${response.user.uid}`).set({
            displayName,
            email,
            emailVerified,
            photoURL,
            uid
          });
        }
        return Observable.of(new UserLoginSuccessAction({
          uid: response.user.uid,
        }));
      }),
    catchError(res => {
        return Observable.of(new UserUnauthAction({}));
      })
    )
    }
  ));




@Effect() logout$: Observable<Action> = this.actions$.pipe(
  ofType(USER_ACTION_TYPES.LOGOUT),
  map((action: UserLoginAction) => action.payload),
  switchMap((payload) => {
    return Observable.fromPromise(this.afAuth.signOut()).pipe(
      map(user => new UserUnauthAction({})),
    catchError(res => Observable.of({})))
  }));
}
