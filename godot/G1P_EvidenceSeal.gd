extends CanvasLayer

@onready var hash_display = $Panel/HashLabel
@onready var metadata_display = $Panel/MetadataLabel

func _ready():
	# Ensure the seal is only visible during high-fidelity capture
	if OS.has_feature("movie"):
		self.visible = true
	else:
		self.visible = false # Hide during interactive twin navigation

func _process(_delta):
	# 1. Access the 'Material Truth' state from the G1P Singleton
	var current_state = G1P_Orchestrator.get_material_truth()
	
	# 2. Generate the immutable frame hash
	var frame_data = {
		"lat": current_state.latitude,
		"lon": current_state.longitude,
		"bfe_sim": current_state.simulated_elevation,
		"usgs_gauge": current_state.gauge_03378500_level,
		"timestamp": Time.get_unix_time_from_system()
	}
	var sha256_hash = str(frame_data).sha256_text()
	
	# 3. Update the Evidence Seal UI
	hash_display.text = "G1P-VERIFIED: " + sha256_hash.left(16) + "..."
	metadata_display.text = "SIM_ELEV: " + str(current_state.simulated_elevation) + "ft | DATUM: NAVD88"
