import React, { Component } from "react";

export default class Dashboard extends Component {
  render() {
    console.log();
    return (
      <div>
        Hei<br />
        {this.props.projects.map(project => (
          <div style={{ marginBottom: "20px" }}>
            <h3>Name: {project.name}</h3>
            <div className="members">
              <h4>Members:</h4>
              {project.members.map(member => (
                <div className="member">
                  <strong>Name:</strong> {member.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
