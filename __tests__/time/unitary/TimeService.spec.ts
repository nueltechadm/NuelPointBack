import Time from "@src/core/entities/Time";
import AbstractDBContext from "@src/data/abstract/AbstractDBContext";
import TimeService from "@src/services/TimeService";
import Mock from "../../../__tests__/utils/Mock";
import AbstractSet from "myorm_core/lib/objects/abstract/AbastractSet";

describe("TimeService", ()=>
{
    describe("GetAllAsync",()=>{


        test("Should pass and call ToListAsync", async ()=>
        {        
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Time>>();
           
            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("OrderBy", () => collection);  
            collection.DefineBehavior("ToListAsync", () => Promise.resolve([]));  
            collection.DefineBehavior("Where", () => collection);  
          
            let service = new TimeService(context); 
          
            let result = await service.GetAllAsync();
        
            expect.assertions(3);     
           
            expect(result instanceof Array).toBeTruthy();

            expect(collection.HasCalled("Where")).toBe(0);

            expect(collection.HasCalled("ToListAsync")).toBe(1);
            
        });
    
    
    });

});