import React from 'react';
import JobPostHeader from './RecNextCompo/JobPostHeader';
import Tablisted from './RecNextCompo/Tablisted';

const page = () => {
    return (
        <div className='p-6  space-y-8'> wrq
             <JobPostHeader></JobPostHeader>
             <Tablisted></Tablisted>
        </div>
    );
};

export default page;