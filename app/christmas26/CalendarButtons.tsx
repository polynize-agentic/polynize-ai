import s from './christmas26.module.css';
import { ICS_PATH, directionsUrl, googleCalendarUrl } from '@/lib/christmas26/event';

/**
 * "Add to calendar" (the .ics file: Apple Calendar, Outlook, and most phones) and a text link for
 * Google Calendar. `directions` adds "Get directions". Used in the details section and again after
 * a "yes" reply, so it has no hooks and works on the server and the client.
 */
export function CalendarButtons({ directions = false }: { directions?: boolean }) {
  return (
    <div className={s.actionsWrap}>
      <div className={s.actions}>
        <a className={s.btnPrimary} href={ICS_PATH}>
          Add to calendar
        </a>
        {directions && (
          <a className={s.btnSecondary} href={directionsUrl()} target="_blank" rel="noopener noreferrer">
            Get directions
          </a>
        )}
      </div>
      <p className={s.altLink}>
        <a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer">
          Add to Google Calendar
        </a>
      </p>
    </div>
  );
}
