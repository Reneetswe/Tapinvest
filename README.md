# BSE Trading Platform 🇧🇼

A professional MetaTrader-style trading platform built specifically for the Botswana Stock Exchange (BSE). Connect with licensed BSE brokers and trade local stocks like Letshego, ABSA, Chobe Holdings, and more.

## ✨ Features

### 🚀 Core Trading Features
- **Real-Time Market Data**: Live BSE stock prices with WebSocket updates
- **Professional Charts**: Advanced charting with technical indicators (RSI, MACD, Moving Averages)
- **Order Management**: Market, Limit, and Stop Loss orders with stop-loss and take-profit
- **Portfolio Tracking**: Real-time P&L, margin levels, and performance metrics
- **Risk Management**: Configurable trading limits and margin controls

### 🏦 Broker Integration
- **Stockbrokers Botswana**: Established in 1989, first broker with research function
- **Imara Capital Securities**: Part of Capital Group, started operations in March 2000
- **Motswedi Securities**: Citizen-owned company serving individuals and institutions
- **Secure Connections**: Bank-grade security for broker account connections

### 📊 Portfolio Management
- **Holdings Overview**: Track all your BSE stock positions
- **Performance Analytics**: P&L analysis, returns, and risk metrics
- **Margin Monitoring**: Real-time margin levels and equity tracking
- **Trade History**: Complete order and execution history

### 🎨 User Experience
- **MetaTrader-Style Interface**: Familiar trading platform layout
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Themes**: Customizable interface themes
- **Real-Time Updates**: Live price feeds and portfolio updates

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **React Query** for data management
- **WebSocket** for real-time updates

### Backend
- **Node.js** with Express
- **PostgreSQL** database with Drizzle ORM
- **WebSocket Server** for real-time communication
- **Replit Auth** for secure authentication

### Key Components
```
BotswanaTrade/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities
├── server/                 # Node.js backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database operations
│   └── replitAuth.ts      # Authentication
└── shared/                 # Shared schemas
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Replit account (for authentication)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd BotswanaTrade
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Create .env file
cp .env.example .env

# Configure your environment
DATABASE_URL="postgresql://user:password@localhost:5432/bse_trading"
SESSION_SECRET="your-session-secret"
REPLIT_DOMAINS="your-domain.com"
REPL_ID="your-replit-id"
ISSUER_URL="https://replit.com/oidc"
```

4. **Set up database**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

The platform will be available at `http://localhost:5000`

## 📱 Usage Guide

### 1. Authentication
- Sign up with your email or use Replit authentication
- Complete your profile with personal information
- Verify your account for trading access

### 2. Broker Connection
- Navigate to Settings → Broker Connections
- Enter your broker credentials (Stockbrokers Botswana, Imara Capital, or Motswedi Securities)
- Test connection and verify account access

### 3. Trading
- **Trading Tab**: View charts, place orders, and monitor positions
- **Portfolio Tab**: Track holdings, P&L, and performance
- **Charts Tab**: Advanced technical analysis with indicators
- **Settings Tab**: Configure trading preferences and risk management

### 4. Order Types
- **Market Orders**: Execute immediately at current market price
- **Limit Orders**: Execute at specified price or better
- **Stop Loss**: Automatic sell order at specified price
- **Take Profit**: Automatic sell order at target profit level

### 5. Risk Management
- Set maximum order sizes
- Configure daily loss limits
- Enable automatic stop-loss and take-profit
- Monitor margin levels and equity

## 🔒 Security Features

- **Bank-Grade Encryption**: All data transmitted over HTTPS/WSS
- **Session Management**: Secure session handling with PostgreSQL
- **Authentication**: OAuth 2.0 with Replit integration
- **Input Validation**: Comprehensive input sanitization and validation
- **Rate Limiting**: API rate limiting to prevent abuse

## 📈 Market Data

### Real-Time Updates
- **WebSocket Connection**: Live price feeds every 5 seconds
- **Price History**: Historical data for technical analysis
- **Volume Data**: Trading volume and market activity
- **Market Indicators**: BSE DCI, market cap, and sector performance

### Available Stocks
- **Financials**: Letshego, ABSA, FNB
- **Consumer Services**: Chobe Holdings, Choppies
- **Oil & Gas**: Engen Botswana
- **And more**: 30+ listed companies

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking
npm run db:push      # Push database schema changes
```

### Code Structure
- **Components**: Reusable UI components with TypeScript
- **Hooks**: Custom React hooks for WebSocket and data management
- **API**: RESTful endpoints for trading operations
- **Database**: PostgreSQL with Drizzle ORM for type safety

### Adding New Features
1. Create component in `client/src/components/`
2. Add API endpoint in `server/routes.ts`
3. Update database schema in `shared/schema.ts`
4. Add tests and documentation

## 🧪 Testing

### Frontend Testing
```bash
npm run test:client
```

### Backend Testing
```bash
npm run test:server
```

### Integration Testing
```bash
npm run test:integration
```

## 📊 Performance

- **Real-Time Updates**: < 100ms latency for price updates
- **Chart Rendering**: Optimized canvas-based charts
- **Database Queries**: Indexed queries for fast data retrieval
- **WebSocket**: Efficient real-time communication

## 🔧 Configuration

### Trading Settings
- Order confirmation requirements
- Default stop-loss and take-profit levels
- Commission rates and fee structures
- Margin requirements and risk levels

### Chart Settings
- Timeframe options (1D to 5Y)
- Technical indicators
- Chart themes and layouts
- Data refresh rates

### Notification Settings
- Price alerts and notifications
- Order execution confirmations
- Portfolio performance updates
- Market news and announcements

## 📱 Mobile Support

- **Responsive Design**: Optimized for all screen sizes
- **Touch Gestures**: Swipe and pinch for chart navigation
- **Mobile Trading**: Full trading functionality on mobile devices
- **Progressive Web App**: Install as native app on mobile

## 🌐 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write comprehensive tests
- Update documentation for new features
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [User Guide](docs/user-guide.md)
- [API Reference](docs/api-reference.md)
- [Trading Guide](docs/trading-guide.md)

### Community
- [Discord Server](https://discord.gg/bse-trading)
- [GitHub Issues](https://github.com/your-repo/issues)
- [Email Support](mailto:support@bse-trading.com)

### Emergency Support
- **Trading Issues**: +267 XXX XXX XXX
- **Technical Support**: +267 XXX XXX XXX
- **24/7 Hotline**: Available for urgent trading matters

## 🙏 Acknowledgments

- **BSE Team**: For market data and regulatory guidance
- **Licensed Brokers**: Stockbrokers Botswana, Imara Capital, Motswedi Securities
- **Open Source Community**: For the amazing tools and libraries
- **Botswana Developers**: For building local fintech solutions

## 📈 Roadmap

### Q1 2025
- [ ] Mobile app release
- [ ] Advanced order types
- [ ] Social trading features

### Q2 2025
- [ ] Options trading support
- [ ] AI-powered insights
- [ ] Multi-language support

### Q3 2025
- [ ] Institutional trading
- [ ] Advanced analytics
- [ ] API for third-party apps

---

**Built with ❤️ for Botswana investors**

*This platform is designed to democratize access to the Botswana Stock Exchange, making it easier for all Batswana to participate in wealth creation through local investment opportunities.*
