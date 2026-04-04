from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count
from django.db.models.functions import ExtractHour
from django.utils import timezone
from datetime import datetime

from apps.gym.models import Booking
from apps.users.decorators import role_required


class PeakHoursView(APIView):

    @role_required('admin')
    def get(self, request):
        date_str = request.GET.get('date')
        membership_filter = request.GET.get('membership_type')

        selected_date = (
            datetime.strptime(date_str, '%Y-%m-%d').date()
            if date_str else timezone.now().date()
        )

        bookings = Booking.objects.filter(start_time__date=selected_date)

        if membership_filter:
            bookings = bookings.filter(user__role=membership_filter)

        stats = (
            bookings
            .annotate(hour=ExtractHour('start_time'))
            .values('hour')
            .annotate(count=Count('id'))
            .order_by('hour')
        )

        capacity = 10
        chart_data = {item['hour']: item['count'] for item in stats}
        count_data = [chart_data.get(i, 0) for i in range(24)]
        percentage_data = [round((chart_data.get(i, 0) / capacity) * 100, 1) for i in range(24)]

        return Response({
            'labels': list(range(24)),
            'count_data': count_data,
            'percentage_data': percentage_data,
            'selected_date': selected_date.strftime('%Y-%m-%d'),
            'membership_filter': membership_filter or '',
        })
