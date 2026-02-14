// Simple username management
// Since we have a single-user system, we can store the username locally
export const userProfile = {
  setUsername: (name: string) => {
    localStorage.setItem('ls-username', name);
  },
  
  getUsername: (): string => {
    const stored = localStorage.getItem('ls-username');
    if (stored) return stored;
    
    // Fallback: try to extract from any stored email
    const email = localStorage.getItem('ls-user-email');
    if (email) {
      const name = email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    
    return 'Salon';
  },
  
  clear: () => {
    localStorage.removeItem('ls-username');
    localStorage.removeItem('ls-user-email');
  }
};
