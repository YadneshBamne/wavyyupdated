# Generated by Django 5.1.4 on 2025-01-20 17:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0044_services_service_image_alter_teammember_profile_img"),
    ]

    operations = [
        migrations.AddField(
            model_name="business",
            name="latitude",
            field=models.FloatField(default=1),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="business",
            name="longitude",
            field=models.FloatField(default=1),
            preserve_default=False,
        ),
    ]
