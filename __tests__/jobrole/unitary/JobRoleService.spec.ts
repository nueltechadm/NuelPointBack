import Mock from '../../utils/Mock';
import AbstractDBContext from '@src/data/abstract/AbstractDBContext';
import AbstractSet from 'myorm_core/lib/objects/abstract/AbastractSet';
import JobRole from '@src/core/entities/JobRole';
import JobRoleService from '@src/services/JobRoleService';

describe("JobRoleService", () => {

    describe("GetAllAsync", () => {

        test("Should return a list of all fakes", async () => {           
            
            let context = Mock.CreateIntanceFromAbstraction<AbstractDBContext>(); 
            let collection = Mock.CreateIntanceFromAbstraction<AbstractSet<JobRole>>();
           
            context.DefineBehavior("Collection", () => collection);  
            collection.DefineBehavior("ToListAsync", () => Promise.resolve([]));  
            collection.DefineBehavior("Where", () => collection);  
          
            let service = new JobRoleService(context); 
          
            let result = await service.GetAllAsync();
        
            expect.assertions(3);     
           
            expect(result instanceof Array).toBeTruthy();

            expect(collection.HasCalled("Where")).toBe(0);

            
            expect(collection.HasCalled("ToListAsync")).toBe(1);
           
        });
    });
});