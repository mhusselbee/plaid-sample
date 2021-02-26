import { create } from "domain";
import { createContainer } from "unstated-next";

const usePlaidApiContainer = () => {
    return {
      
        
  };
};

export const {
  Provider: PlaidApiProvider,
  useContainer: usePlaidApi,
} = createContainer(usePlaidApiContainer);
