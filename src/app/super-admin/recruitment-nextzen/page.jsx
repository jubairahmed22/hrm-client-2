import React from 'react';
import JobPostHeader from './RecNextCompo/JobPostHeader';
import Tablisted from './RecNextCompo/Tablisted';
import RejectedList from './RecNextCompo/RejectedList';

const page = () => {
    return (
        <div className='p-6  space-y-8'>
             <JobPostHeader></JobPostHeader>
             <Tablisted></Tablisted>
             <RejectedList></RejectedList>
        </div>
    );
};

export default page;