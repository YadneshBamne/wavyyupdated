# Generated by Django 5.1.4 on 2025-01-14 15:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0037_servicecategory_parent_alter_services_category"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="servicecategory",
            name="parent",
        ),
    ]
