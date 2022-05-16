A common cause of confusion is the difference between **this** and **gameObject** in Unity code.

**this** is the current component, so for example if inside Player.cs then `Destroy(this)` would destroy the Player component, but not the game object in the scene of hierarchy.

**gameObject** is the current game object. So in the example of a Player game object, with a Player.cs component script added then `Destroy(gameObject)` would delete the entire game object from the scene and hierarchy, not just the Player component.