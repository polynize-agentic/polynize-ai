import s from './christmas26.module.css';
import { ICS_PATH, googleCalendarUrl } from '@/lib/christmas26/event';

/**
 * "Add to calendar" (the .ics file: Apple Calendar, Outlook, and most phones) and a text link for
 * Google Calendar. Marrs, 25 November: the RSVP comes first, and the calendar is offered only
 * after a guest says yes. So this shows in the thank-you panel and nowhere else.
 */
export function CalendarButtons() {
  return (
    <div className={s.actionsWrap}>
      <div className={s.actions}>
        <a className={s.btnPrimary} href={ICS_PATH}>
          Add to calendar
        </a>
      </div>
      <p className={s.altLink}>
        <a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer">
          Add to Google Calendar
        </a>
      </p>
    </div>
  );
}
