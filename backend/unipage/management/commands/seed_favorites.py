"""
Seed test Favorite records so the UniApplicantsPage has data to display.

Usage:
    python manage.py seed_favorites                          # uses Astana IT University (code 522)
    python manage.py seed_favorites --university 522
    python manage.py seed_favorites --university 522 --clear # wipe existing first
"""
from django.core.management.base import BaseCommand, CommandError
from unipage.models import University, UniversityProgram
from userpage.models import User, Applicant, Favorite


class Command(BaseCommand):
    help = "Seed test Favorite records for a university"

    def add_arguments(self, parser):
        parser.add_argument(
            "--university", type=int, default=522,
            help="University code (default: 522 = Astana IT University)"
        )
        parser.add_argument(
            "--clear", action="store_true",
            help="Delete existing favorites for this university before seeding"
        )

    def handle(self, *args, **options):
        uni_code = options["university"]

        try:
            university = University.objects.get(code=uni_code)
        except University.DoesNotExist:
            raise CommandError(f"University with code {uni_code} not found.")

        programs = list(UniversityProgram.objects.filter(university=university))
        if not programs:
            raise CommandError(f"{university.name} has no programs to favourite.")

        applicants = list(User.objects.filter(role="APPLICANT"))
        if not applicants:
            raise CommandError("No applicant users found. Create some first.")

        if options["clear"]:
            deleted, _ = Favorite.objects.filter(
                program_id__in=[str(p.code) for p in programs]
            ).delete()
            self.stdout.write(f"Cleared {deleted} existing favorites.")

        created_count = 0
        for user in applicants:
            # Give each applicant 1-2 programs from this university
            for program in programs[: max(1, len(programs) // 2)]:
                _, created = Favorite.objects.get_or_create(
                    user=user,
                    program_id=str(program.code),
                )
                if created:
                    created_count += 1
                    # Ensure applicant profile exists with a sensible UNT score
                    profile, _ = Applicant.objects.get_or_create(user=user)
                    if profile.unt_score == 0:
                        import random
                        profile.unt_score = random.randint(60, 140)
                        profile.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Created {created_count} favorites for {len(applicants)} applicants "
                f"at {university.name}."
            )
        )
