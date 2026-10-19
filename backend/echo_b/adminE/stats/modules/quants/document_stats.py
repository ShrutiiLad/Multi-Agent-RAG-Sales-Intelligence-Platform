# modules/document_stats.py
from django.db.models import Count
from core.models import Document
from adminE.stats.statistics import BaseStats


class DocumentStats(BaseStats):
    def total_documents(self):
        try:
            total = Document.objects.count()
            self.logger.log(f"Total documents: {total}")
            return total
        except Exception as e:
            self.logger.log(f"Error fetching total documents count: {e}", exc_info=True)
            return None

    def document_growth_last_month(self):
        try:
            previous_month, previous_year = self.get_previous_month()
            count = Document.objects.filter(created_at__month=previous_month, created_at__year=previous_year).count()
            self.logger.log(f"Documents created last month: {count}")
            return count
        except Exception as e:
            self.logger.log(f"Error calculating document growth for the last month: {e}", exc_info=True)
            return None

    def documents_by_category(self):
        try:
            categories = Document.objects.values('category').annotate(total=Count('id')).order_by('-total')
            self.logger.log("Documents by category calculated.")
            return list(categories)
        except Exception as e:
            self.logger.log(f"Error calculating documents by category: {e}", exc_info=True)
            return None