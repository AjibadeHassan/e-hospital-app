# Generated migration for medical_records app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='MedicalRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('record_type', models.CharField(choices=[('lab_test', 'Lab Test'), ('x_ray', 'X-Ray'), ('ultrasound', 'Ultrasound'), ('ct_scan', 'CT Scan'), ('diagnosis', 'Diagnosis'), ('consultation', 'Consultation'), ('surgery', 'Surgery Report')], max_length=50)),
                ('title', models.CharField(max_length=300)),
                ('description', models.TextField()),
                ('findings', models.TextField(blank=True)),
                ('recommendations', models.TextField(blank=True)),
                ('record_date', models.DateField()),
                ('file_attachment', models.FileField(blank=True, null=True, upload_to='medical_records/')),
                ('is_verified', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('doctor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='medical_records', to=settings.AUTH_USER_MODEL)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='patient_records', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
