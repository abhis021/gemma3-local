import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, MarkdownModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  userMessage = '';
  chatHistory: { role: string, content: string }[] = [];

  models: string[] = [];
  selectedModel: string = '';
  theme: string = 'light';

  @ViewChild('chatWindow') chatWindowRef!: ElementRef;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchModelsAndCurrentModel();
  }

  fetchModelsAndCurrentModel() {
    Promise.all([
      this.http.get<any>('http://localhost:8000/models').toPromise(),
      this.http.get<any>('http://localhost:8000/current-model').toPromise()
    ])
    .then(([modelsRes, currentModelRes]) => {
      this.models = modelsRes.models;
      this.selectedModel = currentModelRes.model;

      if (this.selectedModel && !this.models.includes(this.selectedModel)) {
        this.models.unshift(this.selectedModel);
      }
    });
  }

  onModelChange() {
    this.http.post('http://localhost:8000/set-model', {
      model: this.selectedModel
    }).subscribe();
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;

    this.chatHistory.push({ role: 'user', content: this.userMessage });

    this.http.post<any>('http://localhost:8000/chat', {
      message: this.userMessage
    }).subscribe(res => {
      this.chatHistory.push({ role: 'assistant', content: res.response });
      this.userMessage = '';
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  scrollToBottom() {
    if (this.chatWindowRef) {
      const el = this.chatWindowRef.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
