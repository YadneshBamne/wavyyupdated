# Generated by Django 5.1.4 on 2025-01-14 14:41

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0036_remove_appointment_total_price"),
    ]

    operations = [
        migrations.AddField(
            model_name="servicecategory",
            name="parent",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="subcategories",
                to="api.servicecategory",
            ),
        ),
        migrations.AlterField(
            model_name="services",
            name="category",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="services",
                to="api.servicecategory",
            ),
        ),
    ]
