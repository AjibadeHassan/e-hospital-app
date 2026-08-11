from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Prescription, Medicine
from .serializers import PrescriptionSerializer, MedicineSerializer

class MedicineViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for medicines - read only"""
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'generic_name']
    filter_backends = [SearchFilter, OrderingFilter]
    ordering = ['name']

class PrescriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for prescriptions"""
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'is_active', 'prescription_date']
    search_fields = ['patient__username', 'patient__email']
    ordering_fields = ['prescription_date', 'created_at']
    ordering = ['-prescription_date']
    
    def get_queryset(self):
        """Get prescriptions for current user"""
        user = self.request.user
        if user.role == 'patient':
            return Prescription.objects.filter(patient=user)
        elif user.role == 'doctor':
            return Prescription.objects.filter(doctor=user)
        elif user.role == 'pharmacist':
            return Prescription.objects.all()
        else:
            return Prescription.objects.all()
    
    def perform_create(self, serializer):
        """Create prescription with current user as doctor"""
        if self.request.user.role != 'doctor':
            raise PermissionError('Only doctors can create prescriptions')
        serializer.save(doctor=self.request.user)
    
    @extend_schema(
        description="Get prescriptions for a specific patient",
    )
    @action(detail=False, methods=['get'])
    def patient_prescriptions(self, request):
        """Get all prescriptions for a patient"""
        patient_id = request.query_params.get('patient_id')
        if not patient_id:
            return Response(
                {'detail': 'patient_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        prescriptions = Prescription.objects.filter(patient_id=patient_id)
        serializer = self.get_serializer(prescriptions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @extend_schema(
        description="Mark prescription as dispensed by pharmacist",
    )
    @action(detail=True, methods=['post'])
    def dispense(self, request, pk=None):
        """Mark prescription as dispensed"""
        prescription = self.get_object()
        
        if request.user.role != 'pharmacist':
            return Response(
                {'detail': 'Only pharmacists can dispense prescriptions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if prescription.status == 'dispensed':
            return Response(
                {'detail': 'Prescription already dispensed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        prescription.status = 'dispensed'
        prescription.dispensed_by = request.user
        prescription.save()
        
        return Response(
            {'message': 'Prescription dispensed successfully'},
            status=status.HTTP_200_OK
        )
    
    @extend_schema(
        description="Refill a prescription",
    )
    @action(detail=True, methods=['post'])
    def refill(self, request, pk=None):
        """Request refill for a prescription"""
        prescription = self.get_object()
        
        if prescription.refills_remaining <= 0:
            return Response(
                {'detail': 'No refills remaining'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        prescription.refills_remaining -= 1
        prescription.status = 'refilled'
        prescription.save()
        
        return Response(
            {'message': 'Prescription refilled successfully', 'refills_remaining': prescription.refills_remaining},
            status=status.HTTP_200_OK
        )
    
    @extend_schema(
        description="Download prescription as PDF",
    )
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download prescription as PDF"""
        prescription = self.get_object()
        return Response({
            'message': 'PDF download functionality to be implemented',
            'prescription_id': prescription.id
        }, status=status.HTTP_200_OK)
