import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    onSnapshot,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import { Hoarding, Booking, User, HoardingFilters, BookingStatus } from '@/types';

// ============ USERS ============

export const getUser = async (uid: string): Promise<User | null> => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? (userDoc.data() as User) : null;
};

export const getAllUsers = async (): Promise<User[]> => {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map((doc) => doc.data() as User);
};

export const updateUser = async (uid: string, data: Partial<User>) => {
    await updateDoc(doc(db, 'users', uid), {
        ...data,
        updatedAt: serverTimestamp(),
    });
};

export const getPendingOwners = async (): Promise<User[]> => {
    const q = query(
        collection(db, 'users'),
        where('role', '==', 'owner'),
        where('isApproved', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as User);
};

// ============ HOARDINGS ============

export const getAllHoardings = async (filters?: HoardingFilters): Promise<Hoarding[]> => {
    const constraints: QueryConstraint[] = [where('isActive', '==', true)];

    if (filters?.isVerified !== undefined) {
        constraints.push(where('isVerified', '==', filters.isVerified));
    }

    const q = query(collection(db, 'hoardings'), ...constraints);
    const snapshot = await getDocs(q);

    let hoardings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Hoarding));

    // Sort client-side to avoid composite index
    hoardings.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

    // Client-side filtering for complex queries
    if (filters?.city) {
        hoardings = hoardings.filter((h) =>
            h.location.city.toLowerCase().includes(filters.city!.toLowerCase())
        );
    }
    if (filters?.state) {
        hoardings = hoardings.filter((h) =>
            h.location.state.toLowerCase().includes(filters.state!.toLowerCase())
        );
    }
    if (filters?.minPrice !== undefined) {
        hoardings = hoardings.filter((h) => h.pricePerDay >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
        hoardings = hoardings.filter((h) => h.pricePerDay <= filters.maxPrice!);
    }

    return hoardings;
};

export const getHoarding = async (id: string): Promise<Hoarding | null> => {
    const hoardingDoc = await getDoc(doc(db, 'hoardings', id));
    return hoardingDoc.exists() ? ({ id: hoardingDoc.id, ...hoardingDoc.data() } as Hoarding) : null;
};

export const getOwnerHoardings = async (ownerId: string): Promise<Hoarding[]> => {
    const q = query(collection(db, 'hoardings'), where('ownerId', '==', ownerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Hoarding));
};

export const createHoarding = async (
    data: Omit<Hoarding, 'id' | 'createdAt' | 'updatedAt' | 'isVerified'>
): Promise<string> => {
    const docRef = await addDoc(collection(db, 'hoardings'), {
        ...data,
        isVerified: true, // Auto-verified, no admin approval needed
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
};

export const updateHoarding = async (id: string, data: Partial<Hoarding>) => {
    await updateDoc(doc(db, 'hoardings', id), {
        ...data,
        updatedAt: serverTimestamp(),
    });
};

export const deleteHoarding = async (id: string) => {
    await deleteDoc(doc(db, 'hoardings', id));
};

export const getUnverifiedHoardings = async (): Promise<Hoarding[]> => {
    const q = query(collection(db, 'hoardings'), where('isVerified', '==', false));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Hoarding));
};

// ============ BOOKINGS ============

export const createBooking = async (
    data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'paymentStatus'>
): Promise<string> => {
    const docRef = await addDoc(collection(db, 'bookings'), {
        ...data,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
};

export const getBooking = async (id: string): Promise<Booking | null> => {
    const bookingDoc = await getDoc(doc(db, 'bookings', id));
    return bookingDoc.exists() ? ({ id: bookingDoc.id, ...bookingDoc.data() } as Booking) : null;
};

export const getAdvertiserBookings = async (advertiserId: string): Promise<Booking[]> => {
    const q = query(
        collection(db, 'bookings'),
        where('advertiserId', '==', advertiserId)
    );
    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Booking));
    // Sort client-side to avoid composite index
    return bookings.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
};

export const getOwnerBookings = async (ownerId: string): Promise<Booking[]> => {
    const q = query(
        collection(db, 'bookings'),
        where('ownerId', '==', ownerId)
    );
    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Booking));
    // Sort client-side to avoid composite index
    return bookings.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
};

export const getAllBookings = async (): Promise<Booking[]> => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Booking));
};

export const updateBookingStatus = async (id: string, status: BookingStatus) => {
    await updateDoc(doc(db, 'bookings', id), {
        status,
        updatedAt: serverTimestamp(),
    });
};

export const confirmPayment = async (id: string) => {
    await updateDoc(doc(db, 'bookings', id), {
        status: 'paid',
        paymentStatus: 'confirmed',
        paymentConfirmedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
};

// Check if dates overlap with existing bookings
export const checkDateAvailability = async (
    hoardingId: string,
    startDate: Date,
    endDate: Date,
    excludeBookingId?: string
): Promise<boolean> => {
    const q = query(
        collection(db, 'bookings'),
        where('hoardingId', '==', hoardingId),
        where('status', 'in', ['pending', 'approved', 'paid'])
    );
    const snapshot = await getDocs(q);
    const bookings = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Booking))
        .filter((b) => b.id !== excludeBookingId);

    const start = startDate.getTime();
    const end = endDate.getTime();

    for (const booking of bookings) {
        const bookingStart = booking.startDate.toDate().getTime();
        const bookingEnd = booking.endDate.toDate().getTime();

        // Check for overlap
        if (start <= bookingEnd && end >= bookingStart) {
            return false; // Dates overlap
        }
    }

    return true; // No overlap
};

// Get all booked date ranges for a hoarding
export const getHoardingBookedDates = async (hoardingId: string): Promise<{ start: Date; end: Date }[]> => {
    const q = query(
        collection(db, 'bookings'),
        where('hoardingId', '==', hoardingId),
        where('status', 'in', ['pending', 'approved', 'paid'])
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            start: data.startDate.toDate(),
            end: data.endDate.toDate(),
        };
    });
};

// Real-time listener for bookings
export const subscribeToOwnerBookings = (
    ownerId: string,
    callback: (bookings: Booking[]) => void
) => {
    const q = query(
        collection(db, 'bookings'),
        where('ownerId', '==', ownerId)
    );

    return onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Booking));
        callback(bookings);
    });
};

export { db };
