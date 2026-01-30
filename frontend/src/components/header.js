// Header component
export function createHeader() {
    return `
        <header class="header">
            <div class="logo">
                <i class="fas fa-coins"></i>
                <span>CryptoTrade</span>
            </div>
            <nav class="nav">
                <a href="/">Home</a>
                <a href="/trade">Trade</a>
                <a href="/wallet">Wallet</a>
                <a href="/profile">Profile</a>
            </nav>
        </header>
    `;
}