# Generated by Django 5.1.4 on 2025-01-13 06:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0035_appointment_total_price"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="appointment",
            name="total_price",
        ),
    ]
