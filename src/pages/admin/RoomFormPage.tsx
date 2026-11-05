import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { roomService } from '../../services/room.service';
import { Room, RoomStatus } from '../../types';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { useNotifications } from '../../context/NotificationContext';

const roomValidationSchema = Yup.object().shape({
  roomNumber: Yup.string().required('Room number is required'),
  name: Yup.string().required('Room name is required').min(3, 'At least 3 characters'),
  type: Yup.string().required('Room type is required'),
  floor: Yup.number().required('Floor is required').min(1, 'Minimum floor 1'),
  roomSize: Yup.number().required('Room size in sq ft is required').min(100, 'Minimum 100 sq ft'),
  bedType: Yup.string().required('Bed type is required'),
  maxAdults: Yup.number().required('Max adults is required').min(1, 'At least 1 adult'),
  maxChildren: Yup.number().required('Max children is required').min(0, 'Cannot be negative'),
  pricePerNight: Yup.number().required('Price per night is required').min(10, 'Minimum price $10'),
  discount: Yup.number().min(0, 'Minimum 0%').max(90, 'Maximum 90%'),
  description: Yup.string().required('Description is required').min(15, 'At least 15 characters'),
  status: Yup.string().required('Status is required'),
  imageUrl: Yup.string().url('Must be a valid image URL').required('Main image URL is required')
});

const defaultAmenitiesList = [
  'Free WiFi',
  'Air Conditioning',
  'King Bed',
  'Queen Bed',
  'Private Balcony',
  'Bathtub',
  'Rain Shower',
  'Smart TV',
  'Espresso Machine',
  'Mini Bar',
  'Work Desk',
  'Breakfast Included',
  'Terrace',
  'Kitchenette'
];

export const RoomFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const isEditMode = Boolean(id);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Free WiFi', 'Air Conditioning']);

  const formik = useFormik({
    initialValues: {
      roomNumber: '',
      name: '',
      type: 'Deluxe Room',
      floor: 1,
      roomSize: 350,
      bedType: 'King Bed',
      maxAdults: 2,
      maxChildren: 1,
      pricePerNight: 120,
      discount: 0,
      description: '',
      status: 'Available' as RoomStatus,
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    },
    validationSchema: roomValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload: Omit<Room, 'id'> = {
          roomNumber: values.roomNumber,
          name: values.name,
          type: values.type,
          floor: Number(values.floor),
          roomSize: Number(values.roomSize),
          bedType: values.bedType,
          maxAdults: Number(values.maxAdults),
          maxChildren: Number(values.maxChildren),
          pricePerNight: Number(values.pricePerNight),
          discount: Number(values.discount),
          description: values.description,
          status: values.status,
          amenities: selectedAmenities,
          images: [values.imageUrl],
          rating: 4.8,
          reviewCount: 12
        };

        if (isEditMode && id) {
          await roomService.update(id, payload);
          showToast(`Room ${values.roomNumber} updated successfully!`, 'success');
        } else {
          await roomService.create(payload);
          showToast(`Room ${values.roomNumber} created successfully!`, 'success');
        }
        navigate('/admin/rooms');
      } catch (err: any) {
        showToast(err.message || 'Operation failed', 'danger');
      } finally {
        setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    if (isEditMode && id) {
      roomService.getById(id).then((r) => {
        if (r) {
          formik.setValues({
            roomNumber: r.roomNumber,
            name: r.name,
            type: r.type,
            floor: r.floor,
            roomSize: r.roomSize,
            bedType: r.bedType,
            maxAdults: r.maxAdults,
            maxChildren: r.maxChildren,
            pricePerNight: r.pricePerNight,
            discount: r.discount,
            description: r.description,
            status: r.status,
            imageUrl: r.images[0] || ''
          });
          setSelectedAmenities(r.amenities || []);
        }
        setIsLoading(false);
      });
    }
  }, [id, isEditMode]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  if (isLoading) {
    return <Loader message="Loading room data..." />;
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-4">
        <Link to="/admin/rooms" className="btn btn-light border btn-sm rounded-circle p-1" style={{ width: '32px', height: '32px' }}>
          <i className="bi bi-arrow-left" />
        </Link>
        <div>
          <h2 className="fw-bold text-dark mb-0">
            {isEditMode ? `Edit Room ${formik.values.roomNumber}` : 'Add New Room'}
          </h2>
          <small className="text-muted">Fill in specifications, rates, and amenities</small>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white max-w-4xl mx-auto">
        <form onSubmit={formik.handleSubmit}>
          <h5 className="fw-bold text-dark mb-3">General Information</h5>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <Input
                label="Room Number"
                name="roomNumber"
                placeholder="e.g. 104"
                required
                value={formik.values.roomNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.roomNumber}
                touched={formik.touched.roomNumber}
              />
            </div>

            <div className="col-md-8">
              <Input
                label="Room Name"
                name="name"
                placeholder="e.g. Grand Garden Suite"
                required
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.name}
                touched={formik.touched.name}
              />
            </div>

            <div className="col-md-4">
              <Select
                label="Room Type"
                name="type"
                required
                value={formik.values.type}
                onChange={formik.handleChange}
                options={[
                  { value: 'Single Room', label: 'Single Room' },
                  { value: 'Double Room', label: 'Double Room' },
                  { value: 'Deluxe Room', label: 'Deluxe Room' },
                  { value: 'Family Room', label: 'Family Room' },
                  { value: 'Suite', label: 'Suite' }
                ]}
              />
            </div>

            <div className="col-md-4">
              <Input
                label="Floor Number"
                name="floor"
                type="number"
                min={1}
                required
                value={formik.values.floor}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.floor}
                touched={formik.touched.floor}
              />
            </div>

            <div className="col-md-4">
              <Input
                label="Room Size (sq ft)"
                name="roomSize"
                type="number"
                min={100}
                required
                value={formik.values.roomSize}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.roomSize}
                touched={formik.touched.roomSize}
              />
            </div>

            <div className="col-md-6">
              <Input
                label="Bed Type / Configuration"
                name="bedType"
                placeholder="e.g. 1 King Bed or 2 Twin Beds"
                required
                value={formik.values.bedType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.bedType}
                touched={formik.touched.bedType}
              />
            </div>

            <div className="col-md-3">
              <Input
                label="Max Adults"
                name="maxAdults"
                type="number"
                min={1}
                required
                value={formik.values.maxAdults}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.maxAdults}
                touched={formik.touched.maxAdults}
              />
            </div>

            <div className="col-md-3">
              <Input
                label="Max Children"
                name="maxChildren"
                type="number"
                min={0}
                required
                value={formik.values.maxChildren}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.maxChildren}
                touched={formik.touched.maxChildren}
              />
            </div>
          </div>

          <h5 className="fw-bold text-dark mb-3">Pricing & Operational Status</h5>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <Input
                label="Base Price per Night ($)"
                name="pricePerNight"
                type="number"
                min={10}
                required
                value={formik.values.pricePerNight}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.pricePerNight}
                touched={formik.touched.pricePerNight}
              />
            </div>

            <div className="col-md-4">
              <Input
                label="Discount (%)"
                name="discount"
                type="number"
                min={0}
                max={90}
                value={formik.values.discount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.discount}
                touched={formik.touched.discount}
              />
            </div>

            <div className="col-md-4">
              <Select
                label="Operational Status"
                name="status"
                required
                value={formik.values.status}
                onChange={formik.handleChange}
                options={[
                  { value: 'Available', label: 'Available' },
                  { value: 'Occupied', label: 'Occupied' },
                  { value: 'Reserved', label: 'Reserved' },
                  { value: 'Maintenance', label: 'Maintenance' },
                  { value: 'Cleaning', label: 'Cleaning' }
                ]}
              />
            </div>

            <div className="col-12">
              <Input
                label="Main Display Image URL"
                name="imageUrl"
                placeholder="https://images.unsplash.com/..."
                required
                value={formik.values.imageUrl}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.imageUrl}
                touched={formik.touched.imageUrl}
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-medium text-secondary mb-1">
                Room Description <span className="text-danger">*</span>
              </label>
              <textarea
                name="description"
                rows={3}
                className={`form-control ${formik.touched.description && formik.errors.description ? 'is-invalid' : ''}`}
                placeholder="Provide a compelling overview of this room's features and atmosphere..."
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.description && formik.errors.description && (
                <div className="invalid-feedback d-block">{formik.errors.description}</div>
              )}
            </div>
          </div>

          {/* Amenities Checkboxes */}
          <h5 className="fw-bold text-dark mb-3">Room Amenities & Features</h5>
          <div className="row g-2 mb-4">
            {defaultAmenitiesList.map((amenity) => (
              <div key={amenity} className="col-sm-6 col-md-4">
                <div className="form-check small">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`check-${amenity}`}
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                  />
                  <label className="form-check-label text-dark" htmlFor={`check-${amenity}`}>
                    {amenity}
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-end gap-2 border-top pt-4">
            <Link to="/admin/rooms" className="btn btn-light border px-4">
              Cancel
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="px-4 fw-bold"
              isLoading={formik.isSubmitting}
              icon="bi-check-circle"
            >
              {isEditMode ? 'Save Room Changes' : 'Create Room'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
