// Spotify API Rate Limiter
// Manages API requests to stay within Spotify's rate limits

class SpotifyRateLimiter {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private minInterval = 200; // Minimum 200ms between requests
  private rateLimitedUntil = 0;

  async addRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      // Check if we're rate limited
      const now = Date.now();
      if (now < this.rateLimitedUntil) {
        console.log(`Rate limited, waiting ${this.rateLimitedUntil - now}ms`);
        await this.sleep(this.rateLimitedUntil - now);
      }

      // Ensure minimum interval between requests
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.minInterval) {
        await this.sleep(this.minInterval - timeSinceLastRequest);
      }

      const request = this.queue.shift();
      if (request) {
        try {
          this.lastRequestTime = Date.now();
          await request();
        } catch (error) {
          // If we get a 429, set rate limit backoff
          if (error instanceof Error && error.message.includes('429')) {
            this.rateLimitedUntil = Date.now() + 2000; // Wait 2 seconds
            console.log('Rate limited, backing off for 2 seconds');
          }
        }
      }
    }

    this.isProcessing = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clear queue if needed (e.g., when user logs out)
  clearQueue() {
    this.queue = [];
    this.isProcessing = false;
  }
}

// Export singleton instance
export const spotifyRateLimiter = new SpotifyRateLimiter();