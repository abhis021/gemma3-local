import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  userMessage = '';
  chatHistory: { role: string, content: string }[] = [];

  constructor(private http: HttpClient) {}

  sendMessage() {
    if (!this.userMessage.trim()) return;

    this.chatHistory.push({ role: 'user', content: this.userMessage });

    this.http.post<any>('http://localhost:8000/chat', { message: this.userMessage })
      .subscribe(res => {
        this.chatHistory.push({ role: 'assistant', content: res.response });
        this.userMessage = '';
      });
  }
}
