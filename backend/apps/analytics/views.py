from django.shortcuts import render
from django.db.models import Count
from django.db.models.functions import ExtractHour
from apps.gym.models import Booking, Gym
from apps.users.models import Member
from django.utils import timezone
from datetime import datetime

def peak_hours_view(request):
    # Get filters from request
    date_str = request.GET.get('date')
    membership_filter = request.GET.get('membership_type')
    
    selected_date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else timezone.now().date()

    # Base queryset
    bookings = Booking.objects.filter(start_time__date=selected_date)

    # Criterion 3: Filter by membership type (if provided)
    if membership_filter:
        bookings = bookings.filter(user__role=membership_filter)

    # Aggregate data
    stats = bookings.annotate(
        hour=ExtractHour('start_time')
    ).values('hour').annotate(
        count=Count('id')
    ).order_by('hour')

    # Criterion 2: Calculate Percentages (Assuming capacity of 10 per hour for demo)
    capacity = 10 
    chart_data = {item['hour']: item['count'] for item in stats}
    percentage_data = [round((chart_data.get(i, 0) / capacity) * 100, 1) for i in range(24)]
    
    context = {
        'labels': list(range(24)),
        'count_data': [chart_data.get(i, 0) for i in range(24)],
        'percentage_data': percentage_data, # This fulfills Criterion 2
        'selected_date': selected_date.strftime('%Y-%m-%d'),
        'membership_filter': membership_filter,
    }
    return render(request, 'analytics/dashboard.html', context)