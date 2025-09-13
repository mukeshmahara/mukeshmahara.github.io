import React from 'react';

const Education = () => {
  return (
    <div className="content-section">
      <h2>Education</h2>

      <div className="education-item">
        <div className="education-header">
          <h3>Computer Science and Information Technology</h3>
          <div className="school-info">
            <span className="school-name">Madan Bhandari Memorial College</span>
            <span className="location">Bhaktapur, Kathmandu, Nepal</span>
          </div>
          <div className="duration">06/2016 - 07/2020</div>
        </div>
      </div>

      <div className="education-item">
        <div className="education-header">
          <h3>Science</h3>
          <div className="school-info">
            <span className="school-name">Radiant Higher Secondary School</span>
            <span className="location">Bhimfedistanpat, Kathmandu</span>
          </div>
          <div className="duration">04/2013 - 12/2015</div>
        </div>
      </div>
    </div>
  );
};

export default Education;
