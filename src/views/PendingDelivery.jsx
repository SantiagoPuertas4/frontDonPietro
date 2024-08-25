import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Modal from "../components/ui/Modal/Modal";
import { getPendingDeliveryOrderFn } from "../api/order";
import PendingDeliveryCard from "../components/PendingDelivery/PendingDeliveryCard";

const PendingDelivery = () => {
  const [details, setDetails] = useState();
  const [modal, setModal] = useState(false);
  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["deliveryOrders"],
    queryFn: () => getPendingDeliveryOrderFn(),
  });
  console.log(orders);

  if (isLoading) {
    return <p className="mt-2">Cargando datos...</p>;
  }

  if (isError) {
    return (
      <div className="alert alert-danger mt-3 container">
        <p className="text-black">
          Ocurrió un error cargando la lista de pedidos pendientes a retirar.
        </p>
      </div>
    );
  }

  if (orders && orders.data.length === 0) {
    return (
      <div className="alert alert-info mt-3 container">
        <p className="text-black text-center">
          No se encontraron pedidos pendientes a retirar.
        </p>
      </div>
    );
  }

  return (
    <div className="m-5 row d-flex justify-content-center">
      {modal && <Modal details={details} setModal={setModal} />}
      {orders.data.map((order) => {
        return (
          <PendingDeliveryCard
            key={order.id}
            order={order}
            setDetails={setDetails}
            setModal={setModal}
          />
        );
      })}
    </div>
  );
};
export default PendingDelivery;
