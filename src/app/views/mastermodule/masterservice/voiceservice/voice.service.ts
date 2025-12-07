import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoiceService {

  private recognition: any;
  private isListening = false;

  // Observables
  public isListening$ = new BehaviorSubject<boolean>(false);
  public transcript$ = new Subject<string>();
  public command$ = new Subject<{action: string, target: string}>();
  public error$ = new Subject<string>();

  constructor(private ngZone: NgZone) {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition() || new (window as any).SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition(): void {
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.ngZone.run(() => {
        this.isListening = true;
        this.isListening$.next(true);
      });
    };

    this.recognition.onresult = (event: any) => {
      this.ngZone.run(() => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        this.transcript$.next(transcript);
        this.processCommand(transcript);
      });
    };

    this.recognition.onend = () => {
      this.ngZone.run(() => {
        this.isListening = false;
        this.isListening$.next(false);
      });
    };

    this.recognition.onerror = (event: any) => {
      this.ngZone.run(() => {
        this.isListening = false;
        this.isListening$.next(false);
        this.error$.next(`Speech recognition error: ${event.error}`);
      });
    };
  }

  private processCommand(transcript: string): void {
    // Match patterns like "open opd case", "go to appointment", "navigate to bill"
    const openPattern = /^(open|go to|navigate to|show)\s+(.+)$/i;
    const match = transcript.match(openPattern);

    if (match) {
      const action = match[1].toLowerCase();
      const target = match[2].toLowerCase().trim();
      this.command$.next({ action, target });
    }
  }

  startListening(): void {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }
}
