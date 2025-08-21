import { CalendarComponent } from "@/components/calendar-component";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg p-6 w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground">
          Calendar
        </h1>
        <CalendarComponent />
      </div>
    </div>
  );
}
