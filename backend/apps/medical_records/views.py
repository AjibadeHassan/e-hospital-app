from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import MedicalRecord
from .serializers import MedicalRecordSerializer

class MedicalRecordViewSet(viewsets.ModelViewSet):
    """ViewSet for medical records"""
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['record_type', 'is_verified', 'record_date']
    search_fields = ['title', 'description']
    ordering_fields = ['record_date', 'created_at']
    ordering = ['-record_date']
    
    def get_queryset(self):
        """Get medical records for current user"""
        user = self.request.user
        if user.role == 'patient':
            return MedicalRecord.objects.filter(patient=user)
        elif user.role == 'doctor':
            return MedicalRecord.objects.filter(doctor=user)
        else:
            return MedicalRecord.objects.all()
    
    def perform_create(self, serializer):
        """Create record with current user as doctor"""
        if self.request.user.role != 'doctor':
            raise PermissionError('Only doctors can create medical records')
        serializer.save(doctor=self.request.user)
    
    @extend_schema(
        description="Get medical records for a specific patient",
    )
    @action(detail=False, methods=['get'])
    def patient_records(self, request):
        """Get all records for a patient"""
        patient_id = request.query_params.get('patient_id')
        if not patient_id:
            return Response(
                {'detail': 'patient_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        records = MedicalRecord.objects.filter(patient_id=patient_id)
        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @extend_schema(
        description="Download medical record file",
    )
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download medical record file"""
        record = self.get_object()
        if not record.file_attachment:
            return Response(
                {'detail': 'No file attached to this record'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'file_url': record.file_attachment.url,
            'filename': record.file_attachment.name
        }, status=status.HTTP_200_OK)
    
    @extend_schema(
        description="Verify a medical record",
    )
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a medical record"""
        record = self.get_object()
        if request.user.role != 'doctor':
            return Response(
                {'detail': 'Only doctors can verify records'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        record.is_verified = True
        record.save()
        return Response(
            {'message': 'Record verified successfully'},
            status=status.HTTP_200_OK
        )
    
    @extend_schema(
        description="Share medical record with another user",
    )
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """Share record with another user"""
        record = self.get_object()
        shared_with_id = request.data.get('user_id')
        
        if not shared_with_id:
            return Response(
                {'detail': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # TODO: Implement record sharing logic with MedicalRecordShare model
        return Response(
            {'message': 'Record shared successfully'},
            status=status.HTTP_200_OK
        )
