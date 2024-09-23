import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { Database, ref, set, push, remove, get } from '@angular/fire/database';
import { Firestore, collection, doc, setDoc, getDocs, query, where, deleteDoc } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { getAuth } from 'firebase/auth';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [GoogleMapsModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  center: google.maps.LatLngLiteral = { lat: 39.9334, lng: 32.8597 };
  zoom: number = 16;
  polygons: { polygon: google.maps.Polygon; polygon_id: string }[] = []; 
  selectedPolygon: { polygon: google.maps.Polygon; polygon_id: string } | null = null; 
  drawingId: string | null = null;

  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  drawingManager!: google.maps.drawing.DrawingManager;

  constructor(private db: Database, private firestore: Firestore, private authService: AuthService) {}

  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true, 
    zoomControl: false, 
    mapTypeControl: false, 
    streetViewControl: false,
    fullscreenControl: false, 
  };

  ngAfterViewInit() {
    const currentUser = getAuth().currentUser; 
    if (!currentUser) {
      console.error('Kullanıcı mevcut değil. Giriş yapmalısınız.');
      this.authService.router.navigate(['/login']); 
      return;
    }

    if (this.map.googleMap) {
      this.initializeDrawingManager();
      this.drawingManager.setMap(this.map.googleMap);
    }

    this.loadUserPolygons();
  }

  initializeDrawingManager() {
    const options: google.maps.drawing.DrawingManagerOptions = {
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON]
      },
      polygonOptions: {
        editable: false,
        draggable: false
      }
    };

    this.drawingManager = new google.maps.drawing.DrawingManager(options);

    google.maps.event.addListener(this.drawingManager, 'polygoncomplete', (polygon: google.maps.Polygon) => {
      const userId = getAuth().currentUser?.uid;
      const path = polygon.getPath();
      const vertices: google.maps.LatLngLiteral[] = [];
      const drawingRef = push(ref(this.db, `temporary_drawings/${userId}`));
      this.drawingId = drawingRef.key; 

      for (let i = 0; i < path.getLength(); i++) {
        const xy = path.getAt(i);
        const vertex = { lat: xy.lat(), lng: xy.lng() };
        vertices.push(vertex);

        const vertexRef = ref(this.db, `temporary_drawings/${userId}/${this.drawingId}/vertices/${i}`);
        set(vertexRef, vertex);
      }

      const polygonObject = {
        polygon,
        polygon_id: this.drawingId as string 
      };

      polygon.setOptions({ strokeColor: 'blue' });
      this.polygons.push(polygonObject);

      google.maps.event.addListener(polygon, 'click', () => {
        this.selectPolygon(polygonObject);
      });
    });
  }

  async loadUserPolygons() {
    const userId = getAuth().currentUser?.uid;

    if (!userId) {
      console.error('Kullanıcı kimliği mevcut değil.');
      return;
    }

    const polygonsRef = collection(this.firestore, 'polygons');
    const q = query(polygonsRef, where('user_id', '==', userId));

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const vertices: google.maps.LatLngLiteral[] = data['vertices'];

      const polygon = new google.maps.Polygon({
        paths: vertices,
        strokeColor: 'blue',
        editable: false,
        draggable: false
      });

      polygon.setMap(this.map.googleMap!);
      const polygonObject = { polygon, polygon_id: data['polygon_id'] as string }; 
      this.polygons.push(polygonObject);

      google.maps.event.addListener(polygon, 'click', () => {
        this.selectPolygon(polygonObject);
      });
    });

    console.log('Kullanıcı poligonları başarıyla yüklendi.');
  }

  selectPolygon(polygonObject: { polygon: google.maps.Polygon; polygon_id: string }) {
    this.polygons.forEach(p => p.polygon.setOptions({ strokeColor: 'blue' }));
    this.selectedPolygon = polygonObject;
    polygonObject.polygon.setOptions({ strokeColor: 'red' });
  }

  async deleteSelectedPolygon() {
    if (this.selectedPolygon) {
      this.selectedPolygon.polygon.setMap(null);
      this.polygons = this.polygons.filter(p => p !== this.selectedPolygon);

      const userId = getAuth().currentUser?.uid;
      const polygonDocRef = doc(collection(this.firestore, 'polygons'), `${userId}_${this.selectedPolygon.polygon_id}`);

      if (userId && polygonDocRef) {
        try {
          await deleteDoc(polygonDocRef);
          console.log('Poligon Firestore\'dan başarıyla silindi.');
        } catch (error) {
          console.error('Poligon Firestore\'dan silinirken hata oluştu:', error);
        }
      } else {
        console.error('Kullanıcı ID ya da poligon ID mevcut değil.');
      }

      this.selectedPolygon = null;
    }
  }

  async completePolygon() {
    const userId = getAuth().currentUser?.uid;

    if (!userId) {
      alert("Kullanıcı mevcut değil.");
      console.error('Kullanıcı kimliği mevcut değil.');
      return;
    }

    const drawingsRef = ref(this.db, `temporary_drawings/${userId}`);
    const snapshot = await get(drawingsRef);

    if (!snapshot.exists()) {
      console.error('Geçici veriler bulunamadı.');
      return;
    }

    const drawings = snapshot.val();
    const polygonPromises = [];

    for (const drawingId in drawings) {
      const data = drawings[drawingId];
      const vertices: google.maps.LatLngLiteral[] = data['vertices'];

      const polygonDocRef = doc(collection(this.firestore, 'polygons'), `${userId}_${drawingId}`);

      const userEmail = getAuth().currentUser?.email;
      const userName = userEmail ? userEmail.split('@')[0] : null;

      polygonPromises.push(
        setDoc(polygonDocRef, {
          userName: userName,
          user_id: userId,
          polygon_id: drawingId,
          vertices,
          timestamp: new Date(),
          status: 'completed'
        })
      );
    }

    try {
      await Promise.all(polygonPromises);
      console.log('Tüm poligonlar Firestore\'a başarıyla kaydedildi.');

      await remove(drawingsRef);
      console.log('Tüm geçici poligon verileri Realtime Database\'den silindi.');
    } catch (error) {
      console.error('Poligonlar tamamlanırken hata oluştu:', error);
    }
  }

  logOut() {
    this.authService.logout();
  }
}
