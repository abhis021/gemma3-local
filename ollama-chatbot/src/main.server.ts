import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';

const config: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch())
    // Include any other providers from your original config as needed
  ]
};

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
