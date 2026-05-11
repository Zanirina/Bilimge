import re
import pdfplumber
from django.core.management.base import BaseCommand
from announcements.models import GrantWinner

class Command(BaseCommand):
    help = 'Импорт грантников из PDF'

    def add_arguments(self, parser):
        parser.add_argument('pdf_path', type=str)
        parser.add_argument('--year', type=int, default=2025)

    def handle(self, *args, **options):
        pdf_path = options['pdf_path']
        year = options['year']

        current_field_code = None
        current_field_name = None
        winners = []

        # Паттерн строки: "1   003711723   ИВАНОВ ИВАН ИВАНОВИЧ   123   013"
        row_pattern = re.compile(
            r'^\s*\d+\s+(\d{9})\s+(.+?)\s+(\d{2,3})\s+(\d{3})\s*$'
        )
        # Паттерн специальности: "B001 - Педагогика и психология"
        field_pattern = re.compile(r'(B\d{3})\s*[-–]\s*(.+)')

        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if not text:
                    continue

                for line in text.split('\n'):
                    # Определяем текущую специальность
                    field_match = field_pattern.search(line)
                    if field_match:
                        current_field_code = field_match.group(1).strip()
                        current_field_name = field_match.group(2).strip()
                        continue

                    # Парсим строку грантника
                    row_match = row_pattern.match(line)
                    if row_match and current_field_code:
                        ikt, name, score, ovpo = row_match.groups()
                        winners.append(GrantWinner(
                            ikt=ikt,
                            full_name=name.strip(),
                            score=int(score),
                            university_code=ovpo,
                            field_code=current_field_code,
                            field_name=current_field_name,
                            year=year,
                        ))

                if i % 100 == 0:
                    self.stdout.write(f'Страниц обработано: {i}')

        # Bulk insert
        GrantWinner.objects.bulk_create(winners, batch_size=500)
        self.stdout.write(self.style.SUCCESS(f'Загружено: {len(winners)} записей'))