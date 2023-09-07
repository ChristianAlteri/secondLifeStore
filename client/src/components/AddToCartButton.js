import { useMutation } from "@apollo/client";
import { CREATE_ORDER_WITH_PRODUCTS_USER } from "../utils/mutations";


const AddToCartButton = ({ product }) => {
  const [createOrderForUser] = useMutation(CREATE_ORDER_WITH_PRODUCTS_USER);


  const handleCreateOrder = async () => {
    console.log("entering create order ", product );
  
    // const purchaseDate = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const productId = product._id.toString()
    
    try {
      const { data } = await createOrderForUser({ variables: { productId } });

      console.log("Created order:", data);
      return data;
    } catch (error) {
      if (error.networkError) {
        console.error("Network error:", error.networkError);
      } else if (error.graphQLErrors) {
        console.error("GraphQL errors:", error.graphQLErrors);
      } else {
        console.error("Other error:", error);
      }
    }
  };

  return (
    <button
      className="
        bg-gray-100 
        text-blue 
        py-1
        px-1
        rounded-md 
        shadow-md

        "
      onClick={handleCreateOrder}
    >
      Buy now
    </button>
  );
};

export default AddToCartButton;
