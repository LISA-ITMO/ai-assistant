from src.utils.file_io import load_pdf, preprocess_text
from src.modules.agents import ReviewAgent, TopicAgent
import streamlit as st
import os


if 'uploaded_files' not in st.session_state:
    st.session_state.uploaded_files = []

uploaded_files_dir = "uploaded_files"
if not os.path.exists(uploaded_files_dir):
    os.makedirs(uploaded_files_dir)
else:
    for file_name in os.listdir(uploaded_files_dir):
        if file_name not in st.session_state.uploaded_files:
            st.session_state.uploaded_files.append(file_name)


def save_uploaded_file(uploaded_file):
    with open(os.path.join(uploaded_files_dir, uploaded_file.name), "wb") as f:
        f.write(uploaded_file.getbuffer())
    st.session_state.uploaded_files.append(uploaded_file.name)
    st.rerun()


def delete_uploaded_file(file_name):
    os.remove(os.path.join(uploaded_files_dir, file_name))
    st.session_state.uploaded_files.remove(file_name)
    st.rerun()


st.set_page_config(page_title="Research Assistant", layout="wide")

tabs = st.tabs(["Upload", "Materials", "Generate", "Settings"])

with tabs[0]:
    st.header("Upload Articles")
    uploaded_files = st.file_uploader(
        "Choose PDF files", type="pdf", accept_multiple_files=True)
    if uploaded_files:
        for uploaded_file in uploaded_files:
            save_uploaded_file(uploaded_file)
        st.success("Files uploaded successfully!")

with tabs[1]:
    st.header("Uploaded Articles")
    selected_files = []
    if st.session_state.uploaded_files:
        for idx, file_name in enumerate(st.session_state.uploaded_files):
            col1, col2, col3 = st.columns([3, 1, 1])
            col1.write(file_name)
            if col2.button("Delete", key=f"delete_{idx}"):
                delete_uploaded_file(file_name)
            if col3.button("Generate abstract", key=f"generate_{idx}"):
                st.write(f"Generating abstract for {file_name}...")
                agent = ReviewAgent()
                article_text = load_pdf(
                    os.path.join("uploaded_files", file_name))
                article_text = preprocess_text(article_text)
                abstract = agent.generate_review(article_text)
                st.write(f"Abstract: {abstract}")
            selected = st.checkbox(
                "Select for literature review", key=f"select_{idx}")
            if selected:
                selected_files.append(file_name)
    else:
        st.write("No articles uploaded yet.")
    if selected_files:
        if st.button("Generate literature review"):
            st.write("Generating literature review for selected files...")
            for file_name in selected_files:
                agent = ReviewAgent()
                article_text = load_pdf(
                    os.path.join("uploaded_files", file_name))
                article_text = preprocess_text(article_text)
                review = agent.generate_review(article_text)
                st.write(f"Review for {file_name}: {review}")

with tabs[2]:
    st.header("Generate Article")
    if 'research_topic' not in st.session_state:
        st.session_state.research_topic = ""
    research_topic = st.text_input(
        label="Enter your research topic", value=st.session_state.research_topic)
    if st.button("Refine Topic"):
        agent = TopicAgent()
        refined_topic = agent.generate_topic(research_topic)
        st.write(f"Refined Topic: {refined_topic}")
        if st.button("Accept"):
            st.session_state.research_topic = refined_topic
            st.rerun()
        elif st.button("Reject"):
            st.write("Please continue editing the current topic.")

with tabs[3]:
    st.header("Settings")
    article_length = st.selectbox(
        "Article Length", ["Short", "Medium", "Long"]
    )
    writing_style = st.selectbox(
        "Writing Style", ["Formal", "Informal", "Technical"]
    )
    language = st.selectbox(
        "Language", ["English", "Russian"]
    )
    if st.button("Save Settings"):
        st.session_state.article_length = article_length
        st.session_state.writing_style = writing_style
        st.session_state.language = language
        st.write("Settings saved successfully!")
