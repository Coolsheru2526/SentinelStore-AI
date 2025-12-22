import logging
from langgraph.graph import StateGraph
from state import IncidentState
from agents.vision import vision_react_node
from agents.speech import speech_react_node
from agents.memory_retrieval import memory_retrieval_node
from agents.fusion import fusion_understanding_node
from agents.risk import risk_node
from agents.human import human_review_node
from agents.planning import response_planning_node
from agents.response_llm import response_llm_node
from agents.voice import voice_execution_node
from agents.email import email_execution_node
from agents.call import call_execution_node
from agents.escalation import escalation_node
from agents.monitoring import monitoring_node
from agents.explainability import explainability_node
from agents.learning import learning_node
from agents.self_reflection import self_reflection_node
from config.logging_config import get_logger

logger = get_logger(__name__)

g = StateGraph(IncidentState)
g.add_node("memory", memory_retrieval_node)
g.add_node("vision_agent",vision_react_node)
g.add_node("speech_agent",speech_react_node)
g.add_node("fusion", fusion_understanding_node)
g.add_node("risk", risk_node)
g.add_node("human", human_review_node)
g.add_node("planning", response_planning_node)
g.add_node("respond", response_llm_node)
g.add_node("voice", voice_execution_node)
g.add_node("email", email_execution_node)
g.add_node("call", call_execution_node)
g.add_node("escalate", escalation_node)
g.add_node("monitor", monitoring_node)
g.add_node("explain", explainability_node)
g.add_node("self_reflect", self_reflection_node)
g.add_node("learn", learning_node)

g.set_entry_point("memory")
g.add_edge("memory", "vision_agent")
g.add_edge("vision_agent","speech_agent")
g.add_edge("speech_agent","fusion")
g.add_edge("fusion", "risk")
g.add_conditional_edges("risk", lambda s: "human" if s["requires_human"] else "planning")
g.add_edge("human", "planning")
g.add_edge("planning", "respond")
g.add_edge("respond", "voice")
g.add_edge("voice", "email")
g.add_edge("email", "call")
g.add_edge("call", "escalate")
g.add_edge("escalate", "monitor")
# g.add_conditional_edges("monitor", lambda s: "planning" if not s["resolved"] else "explain")
g.add_edge("monitor","explain")
g.add_edge("explain", "self_reflect")
g.add_edge("self_reflect", "learn")

g.set_finish_point("learn")

incident_graph = g.compile()
logger.info("Incident graph compiled successfully with all nodes and edges")
