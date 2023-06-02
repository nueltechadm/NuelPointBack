import Checkpoint from '../core/entities/Checkpoint';

type CheckpointDTO = Omit<Checkpoint, "Employer"> & {EmployerId : number};

export default CheckpointDTO;

