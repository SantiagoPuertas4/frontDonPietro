import { useEffect, useState } from "react";

import { useSession } from "../stores/useSession";

import { decodeJWT } from "../utilities/decodeJWT";

import UserInfoTable from "../components/MyAccountView/UserInfoTable";
import LocationMap from "../components/ui/Map/LocationMap";

import "../components/MyAccountView/MyAccountView.css";

const MyAccountView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useSession();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          throw new Error("No se encontró el token.");
        }

        const decodedToken = decodeJWT(token);

        const userId = decodedToken.user.id;

        if (!userId) {
          throw new Error("User ID no se encontró en JWT.");
        }

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/orderhistorial/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("La respuesta de la red no fue correcta.");
        }

        const result = await response.json();

        if (Array.isArray(result.data)) {
          setOrders(result.data);
        } else if (result.data) {
          setOrders([result.data]);
        } else {
          throw new Error("Formato de datos inesperado recibido.");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p className="loading">Cargando...</p>;
  if (error) return <p className="error">Error: {error}</p>;
  return (
    <>
      <section className="h1-orders">
        <h1>MI CUENTA</h1>
      </section>
      <UserInfoTable user={user} onLogout={logout} />
      <section className="order-container">
        <h2 className="text-center text-white mt-4 mb-4">
          Historial de pedidos
        </h2>
        {orders.length === 0 ? (
          <p className="text-center text-white">No se encontraron pedidos.</p>
        ) : (
          <article className="orders-grid">
            {orders.map((order) => (
              <div key={order.id} className="order-item">
                <p>
                  <strong>Estado:</strong> {order.status}
                </p>
                <p>
                  <strong>Método de pago:</strong> {order.paymentMethod}
                </p>
                <p>
                  <strong>Mesa:</strong> {order.table}
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Comentarios:</strong>{" "}
                  {order.comments || "Sin comentarios."}
                </p>

                <h3 className="order mt-4">Pedido:</h3>
                <ul>
                  {order.products.map((item, index) => (
                    <li key={index}>
                      <p>
                        <strong>Producto:</strong> {item.product.name}
                      </p>
                      <p>
                        <strong>Cantidad:</strong>{" "}
                        {item.product.quantity || "N/A"}
                      </p>
                      <p>
                        <strong>Precio:</strong> ${item.product.price}.00
                      </p>
                    </li>
                  ))}
                </ul>
                <h4 className="text-white">
                  <strong>Total:</strong> ${order.total}.00
                </h4>
              </div>
            ))}
          </article>
        )}
      </section>
      <section className="container d-flex flex-column g-3 mt-5">
        <LocationMap />
      </section>
    </>
  );
};

export default MyAccountView;
