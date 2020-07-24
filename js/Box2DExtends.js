Box2D.Dynamics.b2Body.prototype.ApplyAngularImpulse = function(impulse)
{
	if (this.IsAwake() == false) {
		this.SetAwake(true);
	}
	this.m_angularVelocity += this.m_invI * impulse;
};