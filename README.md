# Calendar Component Showcase

This is a showcase project demonstrating an **upgraded shadcn calendar component** with advanced features and enhanced functionality. Built with Next.js 15 and modern React patterns.

## 🚀 Features

This upgraded calendar component includes:

- **Interactive Event Management** - Create, view, and manage calendar events
- **Drag & Drop Functionality** - Reschedule events by dragging them to new time slots
- **Time Slot Navigation** - Click on time slots to create new events
- **Event Status System** - Color-coded events with different statuses (Planned, In Progress, Done)
- **Responsive Design** - Works seamlessly across different screen sizes
- **Customizable Time Range** - Configurable start/end times and intervals
- **Disabled Days Support** - Hide weekends or specific days
- **Event Callbacks** - Full event handling for clicks, updates, and interactions

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Radix UI** - Unstyled, accessible UI primitives
- **date-fns** - Modern date utility library
- **react-day-picker** - Flexible date picker component
- **react-dnd** - Drag and drop functionality
- **Jotai** - State management

## 🏃‍♂️ Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/roumel00/calendar-component.git
   cd calendar-example
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Install required shadcn/ui components**
   ```bash
   npx shadcn@latest add button calendar dropdown-menu popover
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the calendar showcase.

## 📋 Usage

The calendar component is highly configurable and can be used in your own projects:

```jsx
import { CalendarComponent } from '@/components/calendar-component';

export default function MyPage() {
  return (
    <div className="min-h-screen bg-background">
      <CalendarComponent />
    </div>
  );
}
```

### Key Features Demonstrated

- **Event Management**: Sample events are included to showcase the calendar's capabilities
- **Interactive Elements**: Click on days, time slots, and events to see console logs
- **Drag & Drop**: Try dragging events to different time slots
- **Responsive Layout**: Resize your browser to see the responsive design

## 🎨 Customization

The calendar component supports various props for customization:

- `startTime` / `endTime` - Define the visible time range
- `interval` - Set time slot intervals (in minutes)
- `disabledDays` - Specify which days to disable
- `calEvents` - Pass your event data
- Event handlers for clicks, updates, and interactions

## 📁 Project Structure

```
calendar-example/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── calendar-component.jsx    # Main calendar showcase
│   └── ui/                # shadcn/ui components
│       └── shadcn-io/     # Upgraded calendar components
├── lib/                   # Utility functions
└── public/                # Static assets
```

## 🤝 Contributing

This is a showcase project, but contributions are welcome! Feel free to:

- Report bugs or issues
- Suggest new features
- Submit pull requests for improvements
- Share your own calendar component enhancements

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Note**: This is a demonstration project showcasing an upgraded shadcn calendar component. The calendar includes advanced features beyond the standard shadcn/ui calendar component, making it suitable for production applications requiring sophisticated event management capabilities.
