import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  chatHistory: { role: string; content: string }[] = [];

  models: string[] = [];
  selectedModel: string = '';
  theme: string = 'light';

  @ViewChild('chatWindow') chatWindowRef!: ElementRef;

  chatSessions = [
    { id: 1, title: 'New Chat' } // default entry
  ];
  currentChatId = 1;
  allChats: Record<number, { role: string; content: string }[]> = {
    1: []// corresponding empty chat history
  };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.fetchModelsAndCurrentModel();
    this.loadChat(this.currentChatId);
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

  loadChat(id: number) {
    this.currentChatId = id;
    this.chatHistory = [...(this.allChats[id] || [])];
    setTimeout(() => this.scrollToBottom(), 100);
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;

    const userMsg = { role: 'user', content: this.userMessage };
    this.chatHistory.push(userMsg);

    this.http.post<any>('http://localhost:8000/chat', {
      message: this.userMessage
    }).subscribe(res => {
      this.chatHistory.push({ role: 'assistant', content: res.response });
      this.userMessage = '';
      this.allChats[this.currentChatId] = [...this.chatHistory];
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  scrollToBottom() {
    if (
      isPlatformBrowser(this.platformId) &&
      this.chatWindowRef?.nativeElement
    ) {
      requestAnimationFrame(() => {
        const el = this.chatWindowRef.nativeElement;
        el.scrollTop = el.scrollHeight;
      });
    }
  }
  renameChat(chat: { id: number, title: string }) {
  const newTitle = prompt('Rename chat:', chat.title);
  if (newTitle?.trim()) {
    chat.title = newTitle.trim();
  }
}

deleteChat(id: number) {
  if (confirm('Are you sure you want to delete this chat?')) {
    this.chatSessions = this.chatSessions.filter(chat => chat.id !== id);
    delete this.allChats[id];
    if (this.currentChatId === id) {
      const fallback = this.chatSessions[0]?.id;
      if (fallback) this.loadChat(fallback);
    }
  }
}

shareChat(id: number) {
  const messages = this.allChats[id] || [];
  const transcript = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  navigator.clipboard.writeText(transcript);
  alert('Chat copied to clipboard!');
}
startNewChat() {
  const nextId = Math.max(...this.chatSessions.map(c => c.id)) + 1;
  const newChat = { id: nextId, title: `Chat ${nextId}` };
  this.chatSessions.push(newChat);
  this.allChats[nextId] = [];
  this.loadChat(nextId);
}

}
