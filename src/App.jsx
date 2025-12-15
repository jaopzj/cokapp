import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { Dashboard } from './pages/Dashboard'
import { Guardians } from './pages/Guardians'
import { Lessons } from './pages/Lessons'
import { LessonView } from './pages/LessonView'
import { ActivityPage } from './pages/ActivityPage'
import { MapPage } from './pages/MapPage'
import { ProfilePage } from './pages/ProfilePage'
import { Admin } from './pages/admin/Admin'
import { AdminLessons } from './pages/admin/AdminLessons'
import { AdminActivities } from './pages/admin/AdminActivities'
import { AdminNotifications } from './pages/admin/AdminNotifications'

function App() {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <p>Carregando...</p>
            </div>
        )
    }

    return (
        <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Rotas protegidas */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/map"
                element={
                    <ProtectedRoute>
                        <MapPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/guardians"
                element={
                    <ProtectedRoute>
                        <Guardians />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/lessons/:guardianId"
                element={
                    <ProtectedRoute>
                        <Lessons />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/lesson/:lessonId"
                element={
                    <ProtectedRoute>
                        <LessonView />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/activity/:lessonId"
                element={
                    <ProtectedRoute>
                        <ActivityPage />
                    </ProtectedRoute>
                }
            />

            {/* Rotas Admin */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <Admin />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/lessons"
                element={
                    <ProtectedRoute>
                        <AdminLessons />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/activities"
                element={
                    <ProtectedRoute>
                        <AdminActivities />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/notifications"
                element={
                    <ProtectedRoute>
                        <AdminNotifications />
                    </ProtectedRoute>
                }
            />

            {/* Rota padrão */}
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}

export default App
