# Hotel Website

A modern, full-stack hotel website built with Next.js, featuring a beautiful frontend and a secure admin panel for content management.

## 🌟 Features

### Frontend Features
- **Beautiful Hero Section** - Eye-catching landing page with smooth animations
- **About Section** - Hotel information with feature highlights
- **Rooms Showcase** - Interactive room gallery with detailed individual room pages
- **Image Gallery** - Categorized photo gallery with filtering
- **Contact Information** - Complete contact details and inquiry form
- **Responsive Design** - Optimized for all devices
- **Smooth Animations** - Enhanced UX with Framer Motion

### Admin Panel Features
- **Secure Authentication** - Environment-based login system
- **Content Management** - Edit all website content including:
  - Hero section text and images
  - About section details
  - Room information and images
  - Gallery photos and categories
  - Contact information
- **Image Upload** - Cloudinary integration for image management
- **Hidden Access** - Admin panel accessible only via direct URL
- **Real-time Updates** - Changes reflect immediately on the frontend

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend
- **MongoDB** with Mongoose for data storage
- **Cloudinary** for image upload and management
- **NextAuth.js** for authentication
- **JWT** for session management
- **bcryptjs** for password security

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── login/          # Admin login page
│   │   └── dashboard/      # Admin dashboard
│   ├── api/
│   │   ├── admin/          # Admin authentication API
│   │   ├── hero/           # Hero section API
│   │   ├── about/          # About section API
│   │   ├── rooms/          # Rooms API
│   │   ├── gallery/        # Gallery API
│   │   ├── contact/        # Contact API
│   │   └── upload/         # Image upload API
│   ├── rooms/[id]/         # Individual room pages
│   └── page.tsx            # Homepage
├── components/
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── Rooms.tsx
│   ├── Gallery.tsx
│   ├── Contact.tsx
│   ├── Header.tsx
│   └── Footer.tsx
├── lib/
│   ├── mongodb.ts          # Database connection
│   └── cloudinary.ts       # Image upload utilities
├── models/
│   └── index.ts           # MongoDB schemas
└── types/
    └── index.ts           # TypeScript type definitions
```

## ⚙️ Environment Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd hotel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env.local` and configure:
   
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/hotel-website
   # or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/hotel-website
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Admin Authentication
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=secure_password_123
   
   # JWT Secret
   JWT_SECRET=your-jwt-secret-key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin/login

## 🔐 Admin Panel Access

The admin panel is secured and can only be accessed via the hidden URL:
- **URL**: `/admin/login`
- **Default Credentials**: 
  - Username: `admin`
  - Password: `secure_password_123` (change in .env.local)

## 🖼️ Image Management

Images are handled through Cloudinary:
1. Set up a Cloudinary account
2. Add your credentials to the environment variables
3. Images uploaded through the admin panel are automatically optimized and stored
4. All images are served with Cloudinary's CDN for optimal performance

## 🏃‍♂️ Running the Project

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 📱 Responsive Design

The website is fully responsive and tested on:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🚀 Deployment

### Prerequisites
1. Set up MongoDB database (local or Atlas)
2. Create Cloudinary account
3. Configure environment variables

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Heroku
- AWS
- DigitalOcean

## 🔧 Customization

### Adding New Sections
1. Create new API endpoints in `src/app/api/`
2. Add corresponding database models
3. Create frontend components
4. Add to admin panel for management

### Styling Customization
- Modify `tailwind.config.js` for custom colors/themes
- Update component styles in individual files
- Add custom CSS in `globals.css`

## 🛡️ Security Features

- **Environment-based authentication**
- **JWT token validation**
- **HTTP-only cookies**
- **CORS protection**
- **Input validation**
- **XSS protection**

## 📊 Default Data

The application comes with sample data:
- Sample hero content
- Default room information
- Gallery images
- Contact information

All can be customized through the admin panel.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MONGODB_URI in environment variables
   - Ensure MongoDB is running (if local)

2. **Cloudinary Upload Fails**
   - Verify Cloudinary credentials
   - Check file size limits

3. **Admin Login Not Working**
   - Verify ADMIN_USERNAME and ADMIN_PASSWORD
   - Check JWT_SECRET is set

4. **Images Not Loading**
   - Ensure proper Cloudinary configuration
   - Check network connectivity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first styling
- Framer Motion for smooth animations
- Cloudinary for image management
- MongoDB for the database solution

---

**Note**: This is a demo application. For production use, implement additional security measures and follow best practices for deployment.
