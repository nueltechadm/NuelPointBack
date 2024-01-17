import Mock from '../../utils/Mock';
import AbstractDBContext from '@src/data/abstract/AbstractDBContext';
import Company from "@entities/Company";
import AbstractSet from 'myorm_core/lib/objects/abstract/AbastractSet';
import CompanyService from '@src/services/CompanyService';

describe("CompanyService", () => {

    describe("GetAllAsync", () => {

        test("Should return a list of all fake companies", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<Company>>();
           
            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("ToListAsync", () => Promise.resolve([]));  
            collection.DefineBehavior("Where", () => collection);  
          
            let service = new CompanyService(context); 
          
            let result = await service.GetAllAsync();
        
            expect.assertions(3);     
           
            expect(result instanceof Array).toBeTruthy();

            expect(collection.HasCalled("Where")).toBe(0);

            expect(collection.HasCalled("ToListAsync")).toBe(1);
           
        });
    });
});