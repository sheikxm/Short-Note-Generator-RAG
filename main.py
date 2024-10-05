import streamlit as st
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA, LLMChain
from langchain_community.llms import LlamaCpp
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser

# Load the PDF documents and set up embeddings
@st.cache_resource
def setup_embeddings():
    # Load documents
    loader = PyPDFDirectoryLoader("/content/drive/MyDrive/10thbook")
    books = loader.load()

    # Split documents into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=50)
    chunks = splitter.split_documents(books)

    # Initialize embeddings and vector store
    embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    vector_store = Chroma.from_documents(chunks, embeddings)
    return vector_store

vector_store = setup_embeddings()

# Set up the retriever
retriever = vector_store.as_retriever(search_kwargs={"k": 5})

# Define your Llama model
llm = LlamaCpp(
    model_path="/content/drive/MyDrive/10thbook/Mistral-7B-Instruct-v0.3.Q4_K_S.gguf",
    temperature=0.2,
    max_tokens=2048,
    top_p=1
)

# Define the chat template and chain
templates = """
<|context|>
you are a social science assistant who follows the instruction and generates the response based on the query and the content provided. Please be truthful and give direct answers.
</s>
<|user|>
{query}
</s>
<|assistant|>
"""

prompt = ChatPromptTemplate.from_template(templates)

rag_chain = (
    {"context": retriever, "query": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# Streamlit UI for chat
st.title("RAG-Powered Chat with Llama Model")

# Initialize session state to store chat messages
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat messages
for message in st.session_state.messages:
    if message["role"] == "user":
        st.markdown(f"<div style='text-align: right;'><b>You:</b> {message['content']}</div>", unsafe_allow_html=True)
    else:
        st.markdown(f"<div style='text-align: left;'><b>AI:</b> {message['content']}</div>", unsafe_allow_html=True)

# Input box for user query
user_input = st.text_input("Your message")

if user_input:
    # Add the user's message to session state
    st.session_state.messages.append({"role": "user", "content": user_input})

    # Invoke RAG chain to get the response
    response = rag_chain.invoke(user_input)

    # Add the AI response to session state
    st.session_state.messages.append({"role": "ai", "content": response})

    # Rerun the app to display the updated chat
    st.experimental_rerun()
