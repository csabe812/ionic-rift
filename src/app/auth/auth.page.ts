import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLogin = true;
  form: FormGroup;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required, Validators.minLength(6)],
      }),
    });
  }

  onSwitchClick() {
    this.isLogin = !this.isLogin;
  }

  onSubmit() {
    if (!this.form.valid) {
      return;
    }
    if (this.isLogin) {
      this.authService
        .login(this.form.value.email, this.form.value.password)
        .subscribe(
          (resp) => {
            this.router.navigateByUrl('/home');
          },
          (error) => {
            this.handleError(error);
          }
        );
    } else {
      this.authService
        .signup(this.form.value.email, this.form.value.password)
        .subscribe((resp) => {
          console.log(resp);
        });
    }
    this.form.reset();
  }

  onSendPasswordResetEmail() {
    if (!this.form.controls.email.valid) {
      this.toastController
        .create({
          message: 'E-mail has not been entered!',
          duration: 1500,
          position: 'top',
        })
        .then((toastEl) => {
          toastEl.present();
        });
      return;
    }
    this.isLoading = true;
    this.alertCtrl
      .create({
        header: 'Are you sure want a reset e-mail?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              this.isLoading = false;
            },
          },
          {
            text: 'Send',
            role: 'confirm',
            handler: () => {
              this.sendResetMail();
            },
          },
        ],
      })
      .then((alertEl) => {
        alertEl.present();
      });
  }

  sendResetMail() {
    this.authService.sendPasswordResetEmail(this.form.value.email).subscribe(
      (resp) => {
        this.toastController
          .create({
            message: 'E-mail has been sent!',
            duration: 1500,
            position: 'top',
          })
          .then((toastEl) => {
            this.isLoading = false;
            toastEl.present();
          });
      },
      (error) => {
        this.handleError(error);
      }
    );
  }

  keyDownFunction(event: KeyboardEvent) {
    if (event.code === 'Enter') {
      this.onSubmit();
    }
  }

  handleError(error) {
    const errorMsg = error.error.error.message;
    let infoMsg = '';
    switch (errorMsg) {
      case 'EMAIL_NOT_FOUND':
        infoMsg = 'Entered e-mail was not found!';
        break;
      default:
        infoMsg = 'Please try again later.';
        break;
    }

    this.alertCtrl
      .create({
        header: 'An error occured!',
        message: infoMsg,
        buttons: ['OK'],
      })
      .then((el) => {
        this.isLoading = false;
        el.present();
      });
  }
}
