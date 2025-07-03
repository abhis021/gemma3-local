import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown';


bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()),  // ✅ Enable Fetch API for HttpClient
    provideMarkdown()
  ]
});
