from django.core.management.base import BaseCommand
from django.core.mail import send_mass_mail
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta
from calendar_app.models import CalendarEvent
from userpage.models import FavoriteUniversity

User = get_user_model()


class Command(BaseCommand):
    help = 'Send reminders for events happening in 3 days'

    def handle(self, *args, **options):
        target_date = timezone.now().date() + timedelta(days=3)

        events = CalendarEvent.objects.filter(
            start_date=target_date,
            visibility__in=['public', 'university']
        )

        if not events.exists():
            self.stdout.write('No events in 3 days.')
            return

        sent_total = 0

        for event in events:
            emails = self._get_emails_for_event(event)
            if not emails:
                continue

            date_str = event.start_date.strftime('%d.%m.%Y')
            time_str = f" в {event.start_time.strftime('%H:%M')}" if event.start_time else ""

            messages = tuple(
                (
                    f'Reminder: {event.title} — after 3 days',
                    f'We remind you that the event will take place in 3 days:\n\n'
                    f'📅 {event.title}\n'
                    f'Date: {date_str}{time_str}\n'
                    f'{event.description[:300] if event.description else ""}\n\n'
                    f'View the calendar: https://bilimge.kz/calendar/',
                    None,
                    [email]
                )
                for email in emails
            )

            send_mass_mail(messages, fail_silently=True)
            sent_total += len(emails)
            self.stdout.write(f'Sent reminder for "{event.title}" to {len(emails)} users')

        self.stdout.write(self.style.SUCCESS(f'Done. Total emails sent: {sent_total}'))

    def _get_emails_for_event(self, event):
        if event.visibility == 'public':
            return list(
                User.objects.filter(email__isnull=False)
                .exclude(email='')
                .values_list('email', flat=True)
            )
        elif event.visibility == 'university' and event.university_id:
            return list(
                FavoriteUniversity.objects.filter(university_id=event.university_id)
                .exclude(user__email='')
                .values_list('user__email', flat=True)
            )
        return []